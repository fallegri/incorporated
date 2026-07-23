import { auth } from "@/lib/auth";

export default async function ObjetivosPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎯 Mis Objetivos</h1>
            <p className="text-gray-600 mt-1">
              Objetivos estratégicos, OKRs y KPIs asignados a tu cargo.
            </p>
          </div>
          <a
            href="/construir"
            className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-violet-700 transition-colors"
          >
            🤖 Generar con IA
          </a>
        </div>
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <span className="text-5xl block mb-4">🎯</span>
        <h2 className="text-lg font-semibold text-gray-900">
          No tienes objetivos definidos aún
        </h2>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Puedes crear objetivos manualmente o usar la función 
          "Construir Lineamientos" para que la IA los genere 
          automáticamente desde tus documentos.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <a
            href="/construir"
            className="inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-5 py-2.5 rounded-md hover:bg-violet-700 transition-colors"
          >
            🏗️ Construir con IA
          </a>
          <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 font-medium px-5 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
            + Crear manualmente
          </button>
        </div>
      </div>
    </div>
  );
}
