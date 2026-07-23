import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

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
        include: { objetivo: { select: { titulo: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    } catch {}
  }

  const hasData = objetivos.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          👋 Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">Tu panel de alineamiento estratégico</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{objetivos.length}</p>
              <p className="text-sm text-gray-500">Objetivos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{kpisCount}</p>
              <p className="text-sm text-gray-500">KPIs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{actividades.length}</p>
              <p className="text-sm text-gray-500">Tareas pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{docsCount}</p>
              <p className="text-sm text-gray-500">Documentos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding if empty */}
      {!hasData && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            🚀 Comencemos — 3 pasos
          </h2>
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg bg-blue-50 border-blue-200">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Carga documentos</p>
                <p className="text-xs text-gray-600">Sube tu PEI, FODA o Plan Operativo</p>
              </div>
              <Link href="/documentos" className="text-sm text-blue-600 font-medium">Ir →</Link>
            </div>
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <span className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Construye lineamientos</p>
                <p className="text-xs text-gray-600">Analiza y extrae objetivos</p>
              </div>
              <Link href="/construir" className="text-sm text-gray-500">Ir →</Link>
            </div>
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <span className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold">3</span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">Configura IA (opcional)</p>
                <p className="text-xs text-gray-500">Conecta Gemini Pro para análisis avanzado</p>
              </div>
              <Link href="/admin/configuracion" className="text-sm text-gray-500">Ir →</Link>
            </div>
          </div>
        </div>
      )}

      {/* Objectives summary */}
      {hasData && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">🎯 Mis Objetivos Estratégicos</h2>
            <Link href="/objetivos" className="text-sm text-blue-600 hover:text-blue-700">Ver todos →</Link>
          </div>
          <div className="space-y-3">
            {objetivos.slice(0, 5).map((obj) => (
              <div key={obj.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <span className={`text-xs px-2 py-0.5 rounded mt-0.5 ${
                  obj.tipo === "ESTRATEGICO" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>{obj.tipo === "ESTRATEGICO" ? "Estratégico" : "Operativo"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{obj.titulo}</p>
                  {obj.kpis?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">{obj.kpis.length} KPIs · {obj.actividades?.length || 0} actividades</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  obj.estado === "APROBADO" ? "bg-green-100 text-green-700" :
                  obj.estado === "EN_PROGRESO" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-500"
                }`}>{obj.estado.replace("_", " ").toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending tasks */}
      {actividades.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Tareas Pendientes (POA)
          </h2>
          <div className="space-y-2">
            {actividades.map((act) => (
              <div key={act.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <input type="checkbox" className="w-4 h-4 rounded text-blue-600" disabled />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{act.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Objetivo: {act.objetivo?.titulo} · Plazo: {act.plazoDias} días
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  act.prioridad === "alta" ? "bg-red-100 text-red-700" :
                  act.prioridad === "media" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-500"
                }`}>{act.prioridad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/documentos" className="bg-white rounded-lg shadow-sm border p-4 hover:border-blue-300 transition-colors block">
          <h3 className="font-semibold text-gray-900 text-sm">📄 Documentos</h3>
          <p className="text-xs text-gray-600 mt-1">Subir PEI, FODA, MOF</p>
        </Link>
        <Link href="/asistente" className="bg-white rounded-lg shadow-sm border p-4 hover:border-violet-300 transition-colors block">
          <h3 className="font-semibold text-gray-900 text-sm">💬 Asistente IA</h3>
          <p className="text-xs text-gray-600 mt-1">Pregunta sobre tu cargo</p>
        </Link>
        <Link href="/admin/configuracion" className="bg-white rounded-lg shadow-sm border p-4 hover:border-gray-400 transition-colors block">
          <h3 className="font-semibold text-gray-900 text-sm">⚙️ Configuración</h3>
          <p className="text-xs text-gray-600 mt-1">IA, temas, preferencias</p>
        </Link>
      </div>
    </div>
  );
}
