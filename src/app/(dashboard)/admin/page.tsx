import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function EquipoAvancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;

  // Get user's real orgId and role from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { organizationId: true, role: true },
  });

  const orgId = user.organizationId || dbUser?.organizationId;
  const role = user.role || dbUser?.role;

  if (!orgId) redirect("/dashboard");

  // Get all employees with their progress
  const employees = await prisma.user.findMany({
    where: { organizationId: orgId, isActive: true },
    include: {
      cargo: { include: { area: true } },
      objetivos: { include: { actividades: true, kpis: true } },
    },
    orderBy: { name: "asc" },
  });

  // Get org stats
  const docsCount = await prisma.document.count({ where: { organizationId: orgId } });
  const areasCount = await prisma.area.count({ where: { organizationId: orgId } });
  const cargosCount = await prisma.cargo.count({ where: { organizationId: orgId } });
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { name: true, aiProvider: true, aiApiKey: true },
  });

  // Calculate per-employee stats
  const employeeStats = employees.map((emp) => {
    const totalAct = emp.objetivos.reduce((sum, o) => sum + o.actividades.length, 0);
    const doneAct = emp.objetivos.reduce(
      (sum, o) => sum + o.actividades.filter((a) => a.estado === "terminado" || a.completada).length, 0
    );
    const enCursoAct = emp.objetivos.reduce(
      (sum, o) => sum + o.actividades.filter((a) => a.estado === "en_curso").length, 0
    );
    const progress = totalAct > 0 ? Math.round((doneAct / totalAct) * 100) : 0;

    return {
      id: emp.id,
      name: emp.name || emp.email,
      email: emp.email,
      role: emp.role,
      cargo: emp.cargo?.name || "Sin cargo",
      area: emp.cargo?.area?.name || "Sin área",
      totalObjetivos: emp.objetivos.length,
      totalActividades: totalAct,
      actividadesTerminadas: doneAct,
      actividadesEnCurso: enCursoAct,
      actividadesPendientes: totalAct - doneAct - enCursoAct,
      progress,
      totalKpis: emp.objetivos.reduce((sum, o) => sum + o.kpis.length, 0),
    };
  });

  const avgProgress = employeeStats.length > 0
    ? Math.round(employeeStats.reduce((sum, e) => sum + e.progress, 0) / employeeStats.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">👥 Equipo y Avance</h1>
        <p className="text-gray-600 mt-1">
          Vista gerencial: avance de objetivos y cumplimiento de metas de todos los colaboradores.
        </p>
      </div>

      {/* Org summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          <p className="text-xs text-gray-500">Empleados</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{areasCount}</p>
          <p className="text-xs text-gray-500">Áreas</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{cargosCount}</p>
          <p className="text-xs text-gray-500">Cargos</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{docsCount}</p>
          <p className="text-xs text-gray-500">Documentos</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <p className={`text-2xl font-bold ${avgProgress >= 70 ? "text-green-600" : avgProgress >= 40 ? "text-yellow-600" : "text-red-600"}`}>
            {avgProgress}%
          </p>
          <p className="text-xs text-gray-500">Avance promedio</p>
        </div>
      </div>

      {/* AI & Config status */}
      <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">🤖</span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Proveedor IA: <span className="capitalize">{org?.aiProvider || "none"}</span>
            </p>
            <p className="text-xs text-gray-500">
              {org?.aiApiKey ? "✅ API Key configurada" : "⚠️ Sin API Key"}
            </p>
          </div>
        </div>
        <a href="/admin/configuracion" className="text-sm text-blue-600 hover:text-blue-700">
          Configurar →
        </a>
      </div>

      {/* Employee table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Avance por Empleado</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Empleado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Cargo</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">Obj.</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">Tareas</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">KPIs</th>
                <th className="px-4 py-3 font-medium text-gray-700">Avance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employeeStats.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{emp.cargo}</p>
                    <p className="text-xs text-gray-500">{emp.area}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{emp.totalObjetivos}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-700">{emp.actividadesTerminadas}</span>
                    <span className="text-gray-400">/</span>
                    <span>{emp.totalActividades}</span>
                  </td>
                  <td className="px-4 py-3 text-center">{emp.totalKpis}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            emp.progress >= 70 ? "bg-green-500" :
                            emp.progress >= 40 ? "bg-yellow-500" :
                            "bg-red-400"
                          }`}
                          style={{ width: `${emp.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-8">{emp.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
