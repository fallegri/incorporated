import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotificacionesClient } from "./notificaciones-client";

export default async function NotificacionesPage() {
  const session = await auth();
  const user = session?.user as any;

  let alertas: any[] = [];

  if (user?.id) {
    try {
      // Get activities that are due (pendiente or en_curso)
      const actividades = await prisma.actividad.findMany({
        where: {
          objetivo: { userId: user.id },
          completada: false,
        },
        include: {
          objetivo: { select: { titulo: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      // Get KPIs in red zone
      const kpis = await prisma.kPI.findMany({
        where: {
          objetivo: { userId: user.id },
        },
        include: {
          objetivo: { select: { titulo: true } },
        },
      });

      // Build alerts for overdue/pending activities
      for (const act of actividades) {
        const plazoDias = parseInt(act.plazoDias) || 0;
        const createdAt = new Date(act.createdAt);
        const deadline = new Date(createdAt.getTime() + plazoDias * 24 * 60 * 60 * 1000);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 7) {
          alertas.push({
            id: `act-${act.id}`,
            tipo: "actividad_vencimiento",
            titulo: daysLeft <= 0
              ? `Actividad vencida: ${act.descripcion}`
              : `Actividad por vencer (${daysLeft} dias): ${act.descripcion}`,
            detalle: `Objetivo: ${act.objetivo.titulo} | Estado: ${act.estado}`,
            prioridad: daysLeft <= 0 ? "alta" : daysLeft <= 3 ? "media" : "baja",
            fecha: deadline.toISOString(),
          });
        }
      }

      // Build alerts for KPIs in red zone
      for (const kpi of kpis) {
        const meta = parseFloat(kpi.meta);
        const actual = parseFloat(kpi.valorActual || "0");
        if (!isNaN(meta) && meta > 0) {
          const porcentaje = (actual / meta) * 100;
          if (porcentaje < 50) {
            alertas.push({
              id: `kpi-${kpi.id}`,
              tipo: "kpi_critico",
              titulo: `KPI en zona roja: ${kpi.nombre}`,
              detalle: `Actual: ${kpi.valorActual || "0"} / Meta: ${kpi.meta} (${Math.round(porcentaje)}%) | Objetivo: ${kpi.objetivo.titulo}`,
              prioridad: "alta",
              fecha: kpi.createdAt.toISOString(),
            });
          }
        }
      }

      // Sort by priority
      const prioridadOrden: Record<string, number> = { alta: 0, media: 1, baja: 2 };
      alertas.sort((a, b) => (prioridadOrden[a.prioridad] || 2) - (prioridadOrden[b.prioridad] || 2));
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">🔔 Notificaciones</h1>
        <p className="text-gray-600 mt-1">
          Alertas sobre actividades por vencer y KPIs en zona critica.
        </p>
      </div>

      <NotificacionesClient alertas={alertas} />
    </div>
  );
}
