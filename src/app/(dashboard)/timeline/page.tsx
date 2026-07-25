import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TimelineClient } from "./timeline-client";

export default async function TimelinePage() {
  const session = await auth();
  const user = session?.user as any;

  let timelineData: any = null;

  if (user?.id) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          createdAt: true,
          cargo: {
            select: { id: true, name: true, description: true },
          },
        },
      });

      if (dbUser) {
        const startDate = dbUser.createdAt;

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

        // Build events
        interface TimelineEvent {
          id: string;
          date: string;
          daysFromStart: number;
          plazo: string;
          type: string;
          title: string;
          description: string;
          status: string;
          priority: string;
        }

        const events: TimelineEvent[] = [];

        for (const act of actividades) {
          const plazoDias = parseInt(act.plazoDias) || 30;
          const deadline = new Date(startDate.getTime() + plazoDias * 24 * 60 * 60 * 1000);

          let plazo = "30";
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

        // Add rhythm milestones
        const rhythmDays: Record<string, number[]> = {
          trimestral: [90, 180, 270, 360],
          semestral: [180, 360],
          anual: [360],
        };

        const addedMilestones = new Set<string>();
        for (const kpi of kpis) {
          const freq = kpi.frecuencia.toLowerCase();
          const days = rhythmDays[freq] || rhythmDays["trimestral"];
          for (const d of days) {
            const key = `${freq}-${d}`;
            if (addedMilestones.has(key)) continue;
            addedMilestones.add(key);
            const mDate = new Date(startDate.getTime() + d * 24 * 60 * 60 * 1000);
            events.push({
              id: `milestone-${key}`,
              date: mDate.toISOString(),
              daysFromStart: d,
              plazo: freq === "semestral" ? "semestral" : freq === "anual" ? "anual" : "trimestral",
              type: "kpi_review",
              title: `Revision ${freq} de KPIs`,
              description: `Ciclo de revision ${freq} - Dia ${d}`,
              status: mDate > new Date() ? "pendiente" : "pasado",
              priority: "alta",
            });
          }
        }

        // Add onboarding milestones
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
            plazo: String(m.days),
            type: "milestone",
            title: m.title,
            description: m.desc,
            status: mDate > new Date() ? "pendiente" : "pasado",
            priority: "alta",
          });
        }

        events.sort((a, b) => a.daysFromStart - b.daysFromStart);

        timelineData = {
          startDate: startDate.toISOString(),
          cargo: dbUser.cargo?.name || "Sin cargo asignado",
          cargoDescription: dbUser.cargo?.description || null,
          totalEvents: events.length,
          events,
        };
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          📅 Linea de Tiempo del Cargo
        </h1>
        <p className="text-gray-600 mt-1">
          Visualizacion cronologica de actividades, hitos y ritmos de revision
          de tu gestion.
        </p>
        {timelineData && (
          <div className="flex gap-4 mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Cargo: {timelineData.cargo}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {timelineData.totalEvents} eventos
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Inicio: {new Date(timelineData.startDate).toLocaleDateString("es")}
            </span>
          </div>
        )}
      </div>

      <TimelineClient data={timelineData} />
    </div>
  );
}
