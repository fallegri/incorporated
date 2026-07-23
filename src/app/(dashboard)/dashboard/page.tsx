import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;

  // TODO: Fetch real counts from DB
  const hasDocuments = false;
  const hasLineamientos = false;

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

      {/* Onboarding flow when empty */}
      {!hasDocuments && !hasLineamientos && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            🚀 Comencemos — 3 pasos para tu alineamiento
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Sigue estos pasos para que el sistema te ayude a definir 
            tus objetivos y lineamientos estratégicos.
          </p>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Carga tus documentos estratégicos
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Sube o pega el contenido de tu PEI, FODA, Plan Operativo, 
                  Manual de Funciones u otros documentos de tu organización.
                  Puedes subir archivos (PDF, Word, Excel, TXT) o pegar texto directamente.
                </p>
                <Link
                  href="/documentos"
                  className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  📄 Ir a cargar documentos →
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg opacity-80">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Construye tus lineamientos
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  El sistema analizará tus documentos y extraerá objetivos 
                  estratégicos, KPIs y actividades. Puedes hacerlo con IA 
                  (Gemini/Ollama) o sin IA (detección por patrones).
                </p>
                <Link
                  href="/construir"
                  className="mt-3 inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  🏗️ Ir a construir lineamientos →
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg opacity-60">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-700">
                  Revisa, ajusta y confirma
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Revisa los objetivos detectados o generados, edítalos según 
                  tu criterio y confírmalos como tus lineamientos oficiales.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats (shown always, zeros when empty) */}
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
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">KPIs identificados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/documentos"
          className="bg-white rounded-lg shadow-sm border p-5 hover:border-blue-300 transition-colors block"
        >
          <h3 className="font-semibold text-gray-900">📄 Subir documentos</h3>
          <p className="text-sm text-gray-600 mt-1">
            Carga PEI, FODA, MOF o pega texto directamente
          </p>
        </Link>

        <Link
          href="/asistente"
          className="bg-white rounded-lg shadow-sm border p-5 hover:border-violet-300 transition-colors block"
        >
          <h3 className="font-semibold text-gray-900">💬 Asistente IA</h3>
          <p className="text-sm text-gray-600 mt-1">
            Pregunta sobre tu cargo, funciones y objetivos
          </p>
        </Link>
      </div>
    </div>
  );
}
