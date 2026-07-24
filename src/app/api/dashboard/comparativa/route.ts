import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/dashboard/comparativa — Compare metrics between 2 gestiones
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    // Get all objectives grouped by gestion
    const allObjetivos = await prisma.objetivo.findMany({
      where: { userId: user.id },
      include: { actividades: true, kpis: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by gestion
    const gestiones: Record<string, any> = {};

    for (const obj of allObjetivos) {
      const gestion = obj.gestion || "2024";
      if (!gestiones[gestion]) {
        gestiones[gestion] = {
          gestion,
          totalObjetivos: 0,
          objetivosCompletados: 0,
          totalActividades: 0,
          actividadesTerminadas: 0,
          actividadesEnCurso: 0,
          actividadesPendientes: 0,
          totalKpis: 0,
          progresoGeneral: 0,
        };
      }

      const g = gestiones[gestion];
      g.totalObjetivos++;
      if (obj.estado === "COMPLETADO") g.objetivosCompletados++;
      g.totalKpis += obj.kpis.length;

      for (const act of obj.actividades) {
        g.totalActividades++;
        if (act.estado === "terminado" || act.completada) g.actividadesTerminadas++;
        else if (act.estado === "en_curso") g.actividadesEnCurso++;
        else g.actividadesPendientes++;
      }
    }

    // Calculate progress percentage
    for (const g of Object.values(gestiones) as any[]) {
      if (g.totalActividades > 0) {
        g.progresoGeneral = Math.round(
          (g.actividadesTerminadas / g.totalActividades) * 100
        );
      }
    }

    // Sort by year
    const sorted = Object.values(gestiones).sort(
      (a: any, b: any) => a.gestion.localeCompare(b.gestion)
    );

    return NextResponse.json({ gestiones: sorted });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al generar comparativa" },
      { status: 500 }
    );
  }
}
