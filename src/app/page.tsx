import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Incorporated
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Sistema inteligente de inserción laboral y alineamiento
          estratégico. Entiende tu cargo, tus objetivos y cómo
          contribuyes al éxito organizacional.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/registro"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Comenzar Gratis
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <span className="text-3xl block mb-3">🏗️</span>
            <h3 className="font-bold text-gray-900 mb-2">Construye Lineamientos</h3>
            <p className="text-sm text-gray-600">
              La IA analiza tu PEI y FODA para generar objetivos
              estratégicos personalizados para tu cargo.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <span className="text-3xl block mb-3">🤖</span>
            <h3 className="font-bold text-gray-900 mb-2">IA Híbrida</h3>
            <p className="text-sm text-gray-600">
              Funciona con Gemini (cloud), Ollama (local) o sin IA.
              Tú eliges según tus necesidades de privacidad.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <span className="text-3xl block mb-3">🎯</span>
            <h3 className="font-bold text-gray-900 mb-2">Alineamiento Total</h3>
            <p className="text-sm text-gray-600">
              OKRs, KPIs y actividades conectados desde tu cargo
              hasta los objetivos institucionales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
