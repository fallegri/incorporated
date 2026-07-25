"use client";

import { useState } from "react";
import Link from "next/link";
import { Comparativa } from "./comparativa";
import { ManagerView } from "./manager-view";

interface Actividad {
  id: string;
  descripcion: string;
  plazoDias: string;
  prioridad: string;
  estado: string;
  completada: boolean;
  objetivo: { id: string; titulo: string };
}

interface Objetivo {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  actividades: {
    id: string;
    descripcion: string;
    plazoDias: string;
    prioridad: string;
    estado: string;
    completada: boolean;
  }[];
  kpis: { id: string; nombre: string }[];
}

interface Props {
  userName: string;
  objetivos: Objetivo[];
  actividades: Actividad[];
  kpisCount: number;
  docsCount: number;
  hasData: boolean;
  userRole: string;
  isEnterprise?: boolean;
  hasMOF?: boolean;
  hasPEI?: boolean;
}

type ExpandedSection = "objetivos" | "tareas" | null;

export function DashboardClient({
  userName,
  objetivos,
  actividades: initialActividades,
  kpisCount,
  docsCount,
  hasData,
  userRole,
  isEnterprise = false,
  hasMOF = false,
  hasPEI = false,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [actividades, setActividades] = useState(initialActividades);
  const [objetivosState, setObjetivosState] = useState(objetivos);
  const [managerView, setManagerView] = useState(false);

  const isManager = ["SUPER_ADMIN", "ADMIN", "DIRECTOR"].includes(userRole);

  const toggleSection = (section: ExpandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const markTaskComplete = async (actId: string) => {
    const act = actividades.find((a) => a.id === actId);
    if (!act) return;

    const newEstado = "terminado";

    // Optimistic update - remove from pending tasks
    setActividades((prev) => prev.filter((a) => a.id !== actId));

    // Update objetivo progress optimistically
    setObjetivosState((prev) =>
      prev.map((obj) => {
        if (obj.id === act.objetivo.id) {
          const updatedActividades = obj.actividades.map((a) =>
            a.id === actId ? { ...a, estado: newEstado, completada: true } : a
          );
          return { ...obj, actividades: updatedActividades };
        }
        return obj;
      })
    );

    try {
      const res = await fetch(`/api/actividades/${actId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newEstado }),
      });

      if (!res.ok) {
        // Revert on error
        setActividades((prev) => [...prev, act]);
        setObjetivosState(objetivos);
      }
    } catch {
      // Revert on error
      setActividades((prev) => [...prev, act]);
      setObjetivosState(objetivos);
    }
  };

  // Calculate progress per objective
  const getObjetivoProgress = (obj: Objetivo) => {
    const total = obj.actividades.length;
    if (total === 0) return { completadas: 0, total: 0, porcentaje: 0 };
    const completadas = obj.actividades.filter(
      (a) => a.completada || a.estado === "terminado"
    ).length;
    return {
      completadas,
      total,
      porcentaje: Math.round((completadas / total) * 100),
    };
  };

  const pendingCount = actividades.length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido, {userName}
            </h1>
            <p className="text-gray-600 mt-1">
              Tu panel de alineamiento estrategico
            </p>
          </div>
          {isManager && (
            <div className="flex gap-2">
              <button
                onClick={() => setManagerView(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !managerView
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Mi trabajo
              </button>
              <button
                onClick={() => setManagerView(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  managerView
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Vista Gerente
              </button>
            </div>
          )}
        </div>
      </div>

      {managerView && isManager ? (
        <ManagerView />
      ) : (
        <>
          {/* Stats - Clickable */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => toggleSection("objetivos")}
              className={`bg-white rounded-lg shadow-sm border p-5 text-left transition-all hover:border-blue-300 hover:shadow-md ${
                expandedSection === "objetivos"
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {objetivosState.length}
                  </p>
                  <p className="text-sm text-gray-500">Objetivos</p>
                </div>
              </div>
              {expandedSection !== "objetivos" && (
                <p className="text-xs text-blue-600 mt-2">
                  Toca para ver detalle
                </p>
              )}
            </button>

            <div className="bg-white rounded-lg shadow-sm border p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{kpisCount}</p>
                  <p className="text-sm text-gray-500">KPIs</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleSection("tareas")}
              className={`bg-white rounded-lg shadow-sm border p-5 text-left transition-all hover:border-green-300 hover:shadow-md ${
                expandedSection === "tareas"
                  ? "border-green-500 ring-2 ring-green-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingCount}
                  </p>
                  <p className="text-sm text-gray-500">Tareas pendientes</p>
                </div>
              </div>
              {expandedSection !== "tareas" && (
                <p className="text-xs text-green-600 mt-2">
                  Toca para gestionar
                </p>
              )}
            </button>

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

          {/* Expanded: Objetivos */}
          {expandedSection === "objetivos" && hasData && (
            <div className="bg-white rounded-lg shadow-sm border p-6 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  🎯 Mis Objetivos Estrategicos
                </h2>
                <div className="flex items-center gap-3">
                  <Link
                    href="/objetivos"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Ver todos
                  </Link>
                  <button
                    onClick={() => setExpandedSection(null)}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {objetivosState.map((obj) => {
                  const progress = getObjetivoProgress(obj);
                  return (
                    <div
                      key={obj.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                obj.tipo === "ESTRATEGICO"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {obj.tipo === "ESTRATEGICO"
                                ? "Estrategico"
                                : "Operativo"}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                obj.estado === "COMPLETADO"
                                  ? "bg-green-100 text-green-700"
                                  : obj.estado === "EN_PROGRESO"
                                  ? "bg-blue-100 text-blue-700"
                                  : obj.estado === "APROBADO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {obj.estado.replace("_", " ").toLowerCase()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {obj.titulo}
                          </p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      {progress.total > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {progress.completadas} de {progress.total} tareas
                              completadas
                            </span>
                            <span className="text-xs font-semibold text-gray-700">
                              {progress.porcentaje}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                progress.porcentaje === 100
                                  ? "bg-green-500"
                                  : progress.porcentaje >= 50
                                  ? "bg-blue-500"
                                  : progress.porcentaje > 0
                                  ? "bg-yellow-500"
                                  : "bg-gray-300"
                              }`}
                              style={{ width: `${progress.porcentaje}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expanded: Tareas Pendientes */}
          {expandedSection === "tareas" && (
            <div className="bg-white rounded-lg shadow-sm border p-6 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  📋 Tareas Pendientes
                </h2>
                <button
                  onClick={() => setExpandedSection(null)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Cerrar
                </button>
              </div>

              {actividades.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay tareas pendientes. Todas completadas.
                </p>
              ) : (
                <div className="space-y-2">
                  {actividades.map((act) => {
                    // Get progress for this task's parent objective
                    const parentObj = objetivosState.find(
                      (o) => o.id === act.objetivo.id
                    );
                    const progress = parentObj
                      ? getObjetivoProgress(parentObj)
                      : null;

                    return (
                      <div
                        key={act.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <button
                          onClick={() => markTaskComplete(act.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 flex items-center justify-center flex-shrink-0 transition-colors"
                          title="Marcar como completada"
                        >
                          <span className="text-transparent hover:text-green-500 text-xs">
                            ✓
                          </span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {act.descripcion}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">
                              Objetivo: {act.objetivo.titulo}
                            </p>
                            {progress && progress.total > 0 && (
                              <span className="text-xs text-blue-600 font-medium">
                                ({progress.completadas}/{progress.total})
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                            act.prioridad === "alta"
                              ? "bg-red-100 text-red-700"
                              : act.prioridad === "media"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {act.prioridad}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {actividades.length > 0 && (
                <p className="text-xs text-gray-400 mt-3 italic">
                  Haz click en el cuadro para marcar la tarea como completada.
                  El avance del objetivo se actualiza automaticamente.
                </p>
              )}
            </div>
          )}

          {/* Enterprise onboarding based on role */}
          {!hasData && isEnterprise && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Onboarding Empresarial
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                La configuracion de la empresa sigue un orden por roles:
              </p>
              <div className="space-y-3 mt-4">
                {/* Step 1: Desarrollo Humano */}
                <div className={`flex items-center gap-4 p-3 border rounded-lg ${
                  !hasMOF && (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "DIRECTOR")
                    ? "bg-purple-50 border-purple-200"
                    : hasMOF ? "bg-green-50 border-green-200" : ""
                }`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    hasMOF ? "bg-green-600 text-white" : "bg-purple-600 text-white"
                  }`}>
                    {hasMOF ? "\u2713" : "1"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Desarrollo Humano: Cargar documentos administrativos
                    </p>
                    <p className="text-xs text-gray-600">
                      MOF, Organigrama, Estructura organizacional, Reglamento interno
                    </p>
                  </div>
                  {!hasMOF && (
                    <Link href="/documentos" className="text-sm text-purple-600 font-medium">
                      Cargar
                    </Link>
                  )}
                </div>

                {/* Step 2: Gerente/Admin */}
                <div className={`flex items-center gap-4 p-3 border rounded-lg ${
                  hasMOF && !hasPEI && (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "DIRECTOR")
                    ? "bg-blue-50 border-blue-200"
                    : hasPEI ? "bg-green-50 border-green-200" : ""
                }`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    hasPEI ? "bg-green-600 text-white" : hasMOF ? "bg-blue-600 text-white" : "bg-gray-300 text-white"
                  }`}>
                    {hasPEI ? "\u2713" : "2"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Gerente/Administrador: Cargar lineamientos estrategicos
                    </p>
                    <p className="text-xs text-gray-600">
                      PEI, POA, FODA, Presupuesto operativo
                    </p>
                  </div>
                  {hasMOF && !hasPEI && (
                    <Link href="/documentos" className="text-sm text-blue-600 font-medium">
                      Cargar
                    </Link>
                  )}
                </div>

                {/* Step 3: Colaborador */}
                <div className={`flex items-center gap-4 p-3 border rounded-lg ${
                  hasMOF && hasPEI ? "bg-green-50 border-green-200" : ""
                }`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    hasMOF && hasPEI ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {hasMOF && hasPEI ? "\u2713" : "3"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Colaborador: Datos pre-cargados listos
                    </p>
                    <p className="text-xs text-gray-600">
                      Construir lineamientos con IA usando los documentos cargados
                    </p>
                  </div>
                  {hasMOF && hasPEI && (
                    <Link href="/construir" className="text-sm text-green-600 font-medium">
                      Construir
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Individual mode onboarding if empty */}
          {!hasData && !isEnterprise && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Comencemos - 3 pasos
              </h2>
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Carga documentos
                    </p>
                    <p className="text-xs text-gray-600">
                      Sube tu PEI, FODA o Plan Operativo
                    </p>
                  </div>
                  <Link
                    href="/documentos"
                    className="text-sm text-blue-600 font-medium"
                  >
                    Ir
                  </Link>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <span className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Construye lineamientos
                    </p>
                    <p className="text-xs text-gray-600">
                      Analiza y extrae objetivos
                    </p>
                  </div>
                  <Link href="/construir" className="text-sm text-gray-500">
                    Ir
                  </Link>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <span className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      Configura IA (opcional)
                    </p>
                    <p className="text-xs text-gray-500">
                      Conecta un proveedor de IA para analisis avanzado
                    </p>
                  </div>
                  <Link
                    href="/admin/configuracion"
                    className="text-sm text-gray-500"
                  >
                    Ir
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Comparativa between gestiones */}
          {hasData && <Comparativa />}

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/documentos"
              className="bg-white rounded-lg shadow-sm border p-4 hover:border-blue-300 transition-colors block"
            >
              <h3 className="font-semibold text-gray-900 text-sm">
                Documentos
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Subir PEI, FODA, MOF
              </p>
            </Link>
            <Link
              href="/asistente"
              className="bg-white rounded-lg shadow-sm border p-4 hover:border-violet-300 transition-colors block"
            >
              <h3 className="font-semibold text-gray-900 text-sm">
                Asistente IA
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Pregunta sobre tu cargo
              </p>
            </Link>
            <Link
              href="/admin/configuracion"
              className="bg-white rounded-lg shadow-sm border p-4 hover:border-gray-400 transition-colors block"
            >
              <h3 className="font-semibold text-gray-900 text-sm">
                Configuracion
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                IA, temas, preferencias
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
