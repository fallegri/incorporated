import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasMinRole } from "@/lib/security/role-guard";

/**
 * GET /api/reportes - Generate report data
 * Requires JEFE_AREA or higher role
 * Query params: tipo (progreso|poa|kpis), gestion (year)
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  if (!hasMinRole(user.role, "JEFE_AREA")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo") || "progreso";
  const gestion = searchParams.get("gestion");

  try {
    const where: any = {};
    if (user.organizationId) {
      where.cargo = { organizationId: user.organizationId };
    }
    if (gestion) {
      where.gestion = gestion;
    }

    const objetivos = await prisma.objetivo.findMany({
      where,
      include: {
        actividades: true,
        kpis: true,
        user: { select: { name: true, email: true } },
        cargo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (tipo === "progreso") {
      // Progress by gestion
      const resumen = objetivos.map((obj) => {
        const totalAct = obj.actividades.length;
        const completadas = obj.actividades.filter((a) => a.completada).length;
        return {
          id: obj.id,
          titulo: obj.titulo,
          tipo: obj.tipo,
          estado: obj.estado,
          gestion: obj.gestion,
          responsable: obj.user?.name || "Sin asignar",
          cargo: obj.cargo?.name || "",
          actividades: { total: totalAct, completadas, porcentaje: totalAct > 0 ? Math.round((completadas / totalAct) * 100) : 0 },
        };
      });

      const totalObjetivos = resumen.length;
      const completados = resumen.filter((o) => o.estado === "COMPLETADO").length;
      const enProgreso = resumen.filter((o) => o.estado === "EN_PROGRESO").length;

      return NextResponse.json({
        tipo: "progreso",
        gestion: gestion || "Todas",
        generadoEn: new Date().toISOString(),
        resumen: {
          totalObjetivos,
          completados,
          enProgreso,
          porcentajeGeneral: totalObjetivos > 0 ? Math.round((completados / totalObjetivos) * 100) : 0,
        },
        objetivos: resumen,
      });
    }

    if (tipo === "poa") {
      // POA compliance
      const resumen = objetivos.map((obj) => {
        const totalAct = obj.actividades.length;
        const completadas = obj.actividades.filter((a) => a.completada).length;
        const enCurso = obj.actividades.filter((a) => a.estado === "en_curso").length;
        return {
          id: obj.id,
          titulo: obj.titulo,
          tipo: obj.tipo,
          estado: obj.estado,
          gestion: obj.gestion,
          responsable: obj.user?.name || "Sin asignar",
          cargo: obj.cargo?.name || "",
          cumplimiento: {
            total: totalAct,
            completadas,
            enCurso,
            pendientes: totalAct - completadas - enCurso,
            porcentaje: totalAct > 0 ? Math.round((completadas / totalAct) * 100) : 0,
          },
        };
      });

      return NextResponse.json({
        tipo: "poa",
        gestion: gestion || "Todas",
        generadoEn: new Date().toISOString(),
        objetivos: resumen,
      });
    }

    if (tipo === "kpis") {
      // KPI report
      const allKpis = objetivos.flatMap((obj) =>
        obj.kpis.map((kpi) => {
          const meta = parseFloat(kpi.meta);
          const actual = parseFloat(kpi.valorActual || "0");
          const porcentaje = !isNaN(meta) && meta > 0 ? Math.round((actual / meta) * 100) : 0;
          let semaforo = "rojo";
          if (porcentaje >= 75) semaforo = "verde";
          else if (porcentaje >= 50) semaforo = "amarillo";

          return {
            id: kpi.id,
            nombre: kpi.nombre,
            metrica: kpi.metrica,
            meta: kpi.meta,
            valorActual: kpi.valorActual || "0",
            porcentaje,
            semaforo,
            frecuencia: kpi.frecuencia,
            objetivo: obj.titulo,
            responsable: obj.user?.name || "Sin asignar",
          };
        })
      );

      const totalKpis = allKpis.length;
      const verdes = allKpis.filter((k) => k.semaforo === "verde").length;
      const amarillos = allKpis.filter((k) => k.semaforo === "amarillo").length;
      const rojos = allKpis.filter((k) => k.semaforo === "rojo").length;

      return NextResponse.json({
        tipo: "kpis",
        gestion: gestion || "Todas",
        generadoEn: new Date().toISOString(),
        resumen: { totalKpis, verdes, amarillos, rojos },
        kpis: allKpis,
      });
    }

    return NextResponse.json({ error: "Tipo de reporte no valido" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al generar reporte: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
