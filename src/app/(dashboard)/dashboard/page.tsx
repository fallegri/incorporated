import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;

  // Fetch real data from DB
  let objetivos: any[] = [];
  let actividades: any[] = [];
  let docsCount = 0;
  let kpisCount = 0;

  if (user?.organizationId) {
    try {
      objetivos = await prisma.objetivo.findMany({
        where: { userId: user.id },
        include: { actividades: true, kpis: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      docsCount = await prisma.document.count({
        where: { organizationId: user.organizationId },
      });

      kpisCount = await prisma.kPI.count({
        where: { objetivo: { userId: user.id } },
      });

      actividades = await prisma.actividad.findMany({
        where: { objetivo: { userId: user.id }, completada: false },
        include: { objetivo: { select: { id: true, titulo: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } catch {}
  }

  const hasData = objetivos.length > 0;

  // Serialize data for client component
  const serializedObjetivos = objetivos.map((obj) => ({
    id: obj.id,
    titulo: obj.titulo,
    descripcion: obj.descripcion,
    tipo: obj.tipo,
    estado: obj.estado,
    actividades: obj.actividades.map((a: any) => ({
      id: a.id,
      descripcion: a.descripcion,
      plazoDias: a.plazoDias,
      prioridad: a.prioridad,
      estado: a.estado,
      completada: a.completada,
    })),
    kpis: obj.kpis.map((k: any) => ({
      id: k.id,
      nombre: k.nombre,
    })),
  }));

  const serializedActividades = actividades.map((act) => ({
    id: act.id,
    descripcion: act.descripcion,
    plazoDias: act.plazoDias,
    prioridad: act.prioridad,
    estado: act.estado,
    completada: act.completada,
    objetivo: {
      id: act.objetivo.id,
      titulo: act.objetivo.titulo,
    },
  }));

  return (
    <DashboardClient
      userName={user?.name || "Usuario"}
      objetivos={serializedObjetivos}
      actividades={serializedActividades}
      kpisCount={kpisCount}
      docsCount={docsCount}
      hasData={hasData}
      userRole={user?.role || "COLABORADOR"}
    />
  );
}
