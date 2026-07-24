import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ObjetivosList } from "./objetivos-list";

export default async function ObjetivosPage() {
  const session = await auth();
  const user = session?.user as any;

  let objetivos: any[] = [];

  if (user?.id) {
    try {
      objetivos = await prisma.objetivo.findMany({
        where: { userId: user.id },
        include: {
          actividades: { orderBy: { createdAt: "asc" } },
          kpis: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎯 Mis Objetivos</h1>
            <p className="text-gray-600 mt-1">
              Objetivos estratégicos, KPIs y actividades de tu cargo.
            </p>
          </div>
          <Link
            href="/construir"
            className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-violet-700 transition-colors"
          >
            🤖 Generar más
          </Link>
        </div>
      </div>

      {objetivos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <span className="text-5xl block mb-4">🎯</span>
          <h2 className="text-lg font-semibold text-gray-900">
            No tienes objetivos definidos aún
          </h2>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            Carga documentos y usa "Construir Lineamientos" para generar 
            objetivos automáticamente.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/construir"
              className="bg-violet-600 text-white font-medium px-5 py-2.5 rounded-md hover:bg-violet-700 transition-colors"
            >
              🏗️ Construir lineamientos
            </Link>
          </div>
        </div>
      ) : (
        <ObjetivosList objetivos={objetivos} />
      )}
    </div>
  );
}
