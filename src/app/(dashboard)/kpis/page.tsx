import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KpisClient } from "./kpis-client";

export default async function KpisPage() {
  const session = await auth();
  const user = session?.user as any;

  let kpis: any[] = [];

  if (user?.id) {
    try {
      kpis = await prisma.kPI.findMany({
        where: {
          objetivo: { userId: user.id },
        },
        include: {
          objetivo: {
            select: {
              id: true,
              titulo: true,
              gestion: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {}
  }

  const serialized = kpis.map((k) => ({
    id: k.id,
    nombre: k.nombre,
    metrica: k.metrica,
    meta: k.meta,
    valorActual: k.valorActual,
    frecuencia: k.frecuencia,
    objetivo: {
      id: k.objetivo.id,
      titulo: k.objetivo.titulo,
      gestion: k.objetivo.gestion,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">📈 Mis KPIs</h1>
        <p className="text-gray-600 mt-1">
          Dashboard de indicadores clave con semaforo verde/amarillo/rojo.
        </p>
      </div>

      <KpisClient kpis={serialized} />
    </div>
  );
}
