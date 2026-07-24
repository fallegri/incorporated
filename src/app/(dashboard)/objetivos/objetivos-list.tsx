"use client";

import { useState } from "react";

interface Actividad {
  id: string;
  descripcion: string;
  plazoDias: string;
  prioridad: string;
  completada: boolean;
}

interface KPI {
  id: string;
  nombre: string;
  metrica: string;
  meta: string;
  valorActual: string | null;
  frecuencia: string;
}

interface Objetivo {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  alineamientoPei: string | null;
  generadoPorIA: boolean;
  actividades: Actividad[];
  kpis: KPI[];
}

interface Props {
  objetivos: Objetivo[];
}

export function ObjetivosList({ objetivos }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {objetivos.map((obj, index) => (
        <div
          key={obj.id}
          className="bg-white rounded-lg shadow-sm border overflow-hidden transition-all"
        >
          {/* Header — clickeable */}
          <button
            onClick={() => toggleExpand(obj.id)}
            className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-lg font-bold text-gray-400 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      obj.tipo === "ESTRATEGICO"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {obj.tipo === "ESTRATEGICO" ? "Estratégico" : "Operativo"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      obj.estado === "APROBADO" ? "bg-green-100 text-green-700" :
                      obj.estado === "EN_PROGRESO" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {obj.estado.replace("_", " ").toLowerCase()}
                    </span>
                    {obj.generadoPorIA && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                        🤖 IA
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 pr-4">
                    {obj.titulo}
                  </p>
                  {obj.actividades.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {obj.actividades.length} actividades · {obj.kpis.length} KPIs
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-gray-400 transition-transform ${
                expandedId === obj.id ? "rotate-180" : ""
              }`}>
                ▼
              </span>
            </div>
          </button>

          {/* Expanded content */}
          {expandedId === obj.id && (
            <div className="border-t border-gray-100 p-5 pt-4 bg-gray-50 space-y-4">
              {/* Description */}
              {obj.descripcion && obj.descripcion !== obj.titulo && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Descripción</p>
                  <p className="text-sm text-gray-700">{obj.descripcion}</p>
                </div>
              )}

              {/* PEI alignment */}
              {obj.alineamientoPei && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Alineamiento PEI</p>
                  <p className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded">
                    📎 {obj.alineamientoPei}
                  </p>
                </div>
              )}

              {/* Activities */}
              {obj.actividades.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Actividades ({obj.actividades.length})
                  </p>
                  <div className="space-y-2">
                    {obj.actividades.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start gap-3 p-3 bg-white border rounded-md"
                      >
                        <input
                          type="checkbox"
                          checked={act.completada}
                          readOnly
                          className="mt-0.5 w-4 h-4 rounded text-blue-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${act.completada ? "line-through text-gray-400" : "text-gray-900"}`}>
                            {act.descripcion}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            act.plazoDias === "30" ? "bg-green-100 text-green-700" :
                            act.plazoDias === "60" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {act.plazoDias} días
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            act.prioridad === "alta" ? "bg-red-50 text-red-600" :
                            act.prioridad === "media" ? "bg-yellow-50 text-yellow-600" :
                            "bg-gray-50 text-gray-500"
                          }`}>
                            {act.prioridad}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KPIs */}
              {obj.kpis.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                    KPIs ({obj.kpis.length})
                  </p>
                  <div className="space-y-2">
                    {obj.kpis.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="p-3 bg-white border rounded-md"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{kpi.nombre}</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {kpi.frecuencia}
                          </span>
                        </div>
                        {kpi.metrica && (
                          <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                            📊 {kpi.metrica}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Meta: <strong className="text-gray-900">{kpi.meta}</strong>
                          </span>
                          {kpi.valorActual && (
                            <span className="text-xs text-gray-500">
                              Actual: <strong className="text-blue-700">{kpi.valorActual}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
