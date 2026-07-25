import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/dashboard/gerente — Manager view: all employees' progress
 * Only accessible by ADMIN, DIRECTOR, SUPER_ADMIN roles
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  // Fallback: get role and orgId from DB if not in JWT
  let role = user.role;
  let orgId = user.organizationId;

  if (!role || !orgId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, organizationId: true },
    });
    role = role || dbUser?.role;
    orgId = orgId || dbUser?.organizationId;
  }

  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "DIRECTOR"];

  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "No autorizado. Solo gerentes y administradores." },
      { status: 403 }
    );
  }

  if (!orgId) {
    return NextResponse.json({ error: "Sin organización" }, { status: 400 });
  }

  try {
    // Get all users in the same organization
    const employees = await prisma.user.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cargo: { select: { name: true } },
        objetivos: {
          include: {
            actividades: true,
            kpis: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const employeeData = employees.map((emp) => {
      const totalObjetivos = emp.objetivos.length;
      const objetivosCompletados = emp.objetivos.filter(
        (o) => o.estado === "COMPLETADO"
      ).length;

      let totalActividades = 0;
      let actividadesCompletadas = 0;
      let actividadesEnCurso = 0;

      for (const obj of emp.objetivos) {
        totalActividades += obj.actividades.length;
        actividadesCompletadas += obj.actividades.filter(
          (a) => a.completada || a.estado === "terminado"
        ).length;
        actividadesEnCurso += obj.actividades.filter(
          (a) => a.estado === "en_curso"
        ).length;
      }

      const progresoGeneral =
        totalActividades > 0
          ? Math.round((actividadesCompletadas / totalActividades) * 100)
          : 0;

      return {
        id: emp.id,
        name: emp.name || emp.email,
        email: emp.email,
        role: emp.role,
        cargo: emp.cargo?.name || "Sin cargo",
        totalObjetivos,
        objetivosCompletados,
        totalActividades,
        actividadesCompletadas,
        actividadesEnCurso,
        actividadesPendientes:
          totalActividades - actividadesCompletadas - actividadesEnCurso,
        progresoGeneral,
        totalKpis: emp.objetivos.reduce((sum, o) => sum + o.kpis.length, 0),
      };
    });

    // Summary stats
    const totalEmployees = employeeData.length;
    const avgProgreso =
      totalEmployees > 0
        ? Math.round(
            employeeData.reduce((sum, e) => sum + e.progresoGeneral, 0) /
              totalEmployees
          )
        : 0;
    const totalObjetivosOrg = employeeData.reduce(
      (sum, e) => sum + e.totalObjetivos,
      0
    );
    const totalCompletadosOrg = employeeData.reduce(
      (sum, e) => sum + e.objetivosCompletados,
      0
    );

    return NextResponse.json({
      resumen: {
        totalEmpleados: totalEmployees,
        progresoPromedio: avgProgreso,
        totalObjetivos: totalObjetivosOrg,
        objetivosCompletados: totalCompletadosOrg,
      },
      empleados: employeeData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al obtener datos gerenciales: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
