import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function EstructuraPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { organizationId: true },
  });

  const orgId = user.organizationId || dbUser?.organizationId;
  if (!orgId) redirect("/dashboard");

  const areas = await prisma.area.findMany({
    where: { organizationId: orgId },
    include: { cargos: { include: { users: { select: { name: true, email: true } } } }, children: true },
    orderBy: { name: "asc" },
  });

  const cargos = await prisma.cargo.findMany({
    where: { organizationId: orgId },
    include: { area: true, users: { select: { name: true, email: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">🏢 Estructura Organizacional</h1>
        <p className="text-gray-600 mt-1">
          Áreas, cargos y organigrama de la empresa.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{areas.length}</p>
          <p className="text-sm text-gray-500">Áreas</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{cargos.length}</p>
          <p className="text-sm text-gray-500">Cargos</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">
            {cargos.reduce((sum, c) => sum + c.users.length, 0)}
          </p>
          <p className="text-sm text-gray-500">Personas asignadas</p>
        </div>
      </div>

      {/* Areas with cargos */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Organigrama</h2>
        </div>
        <div className="p-4 space-y-4">
          {areas.length === 0 && (
            <p className="text-gray-400 text-center py-6">No hay áreas definidas. Carga un organigrama en Documentos.</p>
          )}
          {areas.map((area) => (
            <div key={area.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏢</span>
                <h3 className="font-semibold text-gray-900">{area.name}</h3>
                {area.children.length > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {area.children.length} sub-áreas
                  </span>
                )}
              </div>
              {area.cargos.length > 0 ? (
                <div className="space-y-2 pl-6 border-l-2 border-blue-200">
                  {area.cargos.map((cargo) => (
                    <div key={cargo.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cargo.name}</p>
                        {cargo.users.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {cargo.users.map((u) => u.name || u.email).join(", ")}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        cargo.users.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {cargo.users.length > 0 ? `${cargo.users.length} persona(s)` : "Vacante"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 pl-6">Sin cargos asignados a esta área</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* All cargos list */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Lista de Cargos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Cargo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Área</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Reporta a</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Asignado a</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargos.map((cargo) => (
                <tr key={cargo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cargo.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cargo.area?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{cargo.reportsTo || "—"}</td>
                  <td className="px-4 py-3">
                    {cargo.users.length > 0 ? (
                      <span className="text-green-700">{cargo.users.map((u) => u.name || u.email).join(", ")}</span>
                    ) : (
                      <span className="text-gray-400 italic">Vacante</span>
                    )}
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
