import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          👋 Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Tu panel de alineamiento estratégico
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Objetivos activos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Documentos cargados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">0%</p>
              <p className="text-sm text-gray-500">Onboarding completado</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA: Build lineamientos */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg shadow-sm p-6 text-white">
        <h2 className="text-xl font-bold">🏗️ Construye tus lineamientos</h2>
        <p className="mt-2 text-blue-100">
          Sube tus documentos (PEI, FODA) y la IA generará objetivos
          estratégicos, KPIs y actividades personalizadas para tu cargo.
        </p>
        <a
          href="/construir"
          className="mt-4 inline-block bg-white text-blue-700 font-medium px-5 py-2.5 rounded-md hover:bg-blue-50 transition-colors"
        >
          Comenzar →
        </a>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/documentos"
          className="bg-white rounded-lg shadow-sm border p-5 hover:border-blue-300 transition-colors block"
        >
          <h3 className="font-semibold text-gray-900">📄 Subir documentos</h3>
          <p className="text-sm text-gray-600 mt-1">
            Carga PEI, FODA, MOF para que el asistente los analice
          </p>
        </a>

        <a
          href="/asistente"
          className="bg-white rounded-lg shadow-sm border p-5 hover:border-violet-300 transition-colors block"
        >
          <h3 className="font-semibold text-gray-900">💬 Asistente IA</h3>
          <p className="text-sm text-gray-600 mt-1">
            Pregunta sobre tu cargo, funciones y objetivos
          </p>
        </a>
      </div>
    </div>
  );
}
