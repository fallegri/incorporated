import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/timeline — Build a visual timeline of the user's cargo
 * Returns chronological events: activities by plazo (30/60/90 days)
 * and recurring rhythms (trimestral, semestral, anual milestones)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    // Get user creation date as the start reference
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        createdAt: true,
        cargo: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const startDate = dbUser.createdAt;

    // Get all activities for this user's objectives
    const actividades = await prisma.actividad.findMany({
      where: {
        objetivo: { userId: user.id },
      },
      include: {
        objetivo: {
          select: { titulo: true, tipo: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get KPIs for rhythm milestones
    const kpis = await prisma.kPI.findMany({
      where: {
        objetivo: { userId: user.id },
      },
      select: {
        id: true,
        nombre: true,
        frecuencia: true,
        objetivo: { select: { titulo: true } },
      },
    });

    // Build timeline events
    interface TimelineEvent {
      id: string;
      date: string;
      daysFromStart: number;
      plazo: "30" | "60" | "90" | "trimestral" | "semestral" | "anual";
      type: "activity" | "milestone" | "kpi_review";
      title: string;
      description: string;
      status: string;
      priority: string;
    }

    const events: TimelineEvent[] = [];

    // 1. Map activities by their plazo (deadline in days from start)
    for (const act of actividades) {
      const plazoDias = parseInt(act.plazoDias) || 30;
      const deadline = new Date(startDate.getTime() + plazoDias * 24 * 60 * 60 * 1000);

      let plazo: TimelineEvent["plazo"] = "30";
      if (plazoDias <= 30) plazo = "30";
      else if (plazoDias <= 60) plazo = "60";
      else plazo = "90";

      events.push({
        id: act.id,
        date: deadline.toISOString(),
        daysFromStart: plazoDias,
        plazo,
        type: "activity",
        title: act.descripcion,
        description: `Objetivo: ${act.objetivo.titulo}`,
        status: act.estado,
        priority: act.prioridad,
      });
    }

    // 2. Add rhythm milestones based on KPI frequencies
    const rhythmDays: Record<string, number[]> = {
      trimestral: [90, 180, 270, 360],
      semestral: [180, 360],
      anual: [360],
      mensual: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360],
    };

    const addedMilestones = new Set<string>();

    for (const kpi of kpis) {
      const freq = kpi.frecuencia.toLowerCase();
      const days = rhythmDays[freq] || rhythmDays["trimestral"];

      for (const d of days) {
        const milestoneKey = `${freq}-${d}`;
        if (addedMilestones.has(milestoneKey)) continue;
        addedMilestones.add(milestoneKey);

        const milestoneDate = new Date(startDate.getTime() + d * 24 * 60 * 60 * 1000);

        let plazo: TimelineEvent["plazo"] = "trimestral";
        if (freq === "semestral") plazo = "semestral";
        else if (freq === "anual") plazo = "anual";
        else plazo = "trimestral";

        events.push({
          id: `milestone-${milestoneKey}`,
          date: milestoneDate.toISOString(),
          daysFromStart: d,
          plazo,
          type: "kpi_review",
          title: `Revision ${freq} de KPIs`,
          description: `Ciclo de revision ${freq} - Dia ${d}`,
          status: milestoneDate > new Date() ? "pendiente" : "pasado",
          priority: "alta",
        });
      }
    }

    // 3. Add fixed onboarding milestones (30, 60, 90 days)
    const onboardingMilestones = [
      { days: 30, title: "Hito 30 dias: Adaptacion e induccion completa", desc: "Fin del periodo inicial de adaptacion al cargo" },
      { days: 60, title: "Hito 60 dias: Primeros resultados esperados", desc: "Se esperan avances visibles en actividades iniciales" },
      { days: 90, title: "Hito 90 dias: Evaluacion de periodo de prueba", desc: "Revision integral del desempeno en el cargo" },
    ];

    for (const m of onboardingMilestones) {
      const mDate = new Date(startDate.getTime() + m.days * 24 * 60 * 60 * 1000);
      events.push({
        id: `onboarding-${m.days}`,
        date: mDate.toISOString(),
        daysFromStart: m.days,
        plazo: String(m.days) as TimelineEvent["plazo"],
        type: "milestone",
        title: m.title,
        description: m.desc,
        status: mDate > new Date() ? "pendiente" : "pasado",
        priority: "alta",
      });
    }

    // Sort events chronologically
    events.sort((a, b) => a.daysFromStart - b.daysFromStart);

    return NextResponse.json({
      startDate: startDate.toISOString(),
      cargo: dbUser.cargo?.name || "Sin cargo asignado",
      cargoDescription: dbUser.cargo?.description || null,
      totalEvents: events.length,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al generar timeline: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
