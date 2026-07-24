import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActividadesClient } from "./actividades-client";

export default async function ActividadesPage() {
  const session = await auth();
  const user = session?.user as any;

  let actividades: any[] = [];

  if (user?.id) {
    try {
      actividades = await prisma.actividad.findMany({
        where: {
          objetivo: { userId: user.id },
        },
        include: {
          objetivo: {
            select: {
              id: true,
              titulo: true,
              tipo: true,
              estado: true,
              gestion: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {}
  }

  const serialized = actividades.map((a) => ({
    id: a.id,
    descripcion: a.descripcion,
    plazoDias: a.plazoDias,
    prioridad: a.prioridad,
    estado: a.estado,
    completada: a.completada,
    objetivo: {
      id: a.objetivo.id,
      titulo: a.objetivo.titulo,
      tipo: a.objetivo.tipo,
      estado: a.objetivo.estado,
      gestion: a.objetivo.gestion,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">✅ Mis Actividades</h1>
        <p className="text-gray-600 mt-1">
          Vista unificada de todas tus actividades de todos los objetivos.
        </p>
      </div>

      <ActividadesClient actividades={serialized} />
    </div>
  );
}
