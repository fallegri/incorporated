"use client";

import { useState, useEffect } from "react";

interface GestionData {
  gestion: string;
  totalObjetivos: number;
  objetivosCompletados: number;
  totalActividades: number;
  actividadesTerminadas: number;
  actividadesEnCurso: number;
  actividadesPendientes: number;
  totalKpis: number;
  progresoGeneral: number;
}

export function Comparativa() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GestionData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/comparativa");
      const json = await res.json();
      if (res.ok) setData(json.gestiones || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && data.length === 0) loadData();
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-white rounded-lg shadow-sm border p-5 hover:border-blue-300 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">📊 Comparativa entre Gestiones</h3>
            <p className="text-sm text-gray-600 mt-1">
              Compara el avance de tus objetivos entre la gestión anterior y la actual
            </p>
          </div>
          <span className="text-blue-600 text-sm font-medium">Ver →</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">📊 Comparativa de Gestiones</h2>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Cerrar ✕
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400">Cargando datos...</p>}

      {!loading && data.length === 0 && (
        <p className="text-sm text-gray-500">No hay datos de gestiones para comparar.</p>
      )}

      {!loading && data.length > 0 && (
        <>
          {/* Table comparison */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-500 font-medium">Métrica</th>
                  {data.map((g) => (
                    <th key={g.gestion} className="text-center py-2 font-bold text-gray-900">
                      {g.gestion}
                    </th>
                  ))}
                  {data.length >= 2 && (
                    <th className="text-center py-2 font-medium text-blue-700">Δ Cambio</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2.5 text-gray-700">Objetivos totales</td>
                  {data.map((g) => (
                    <td key={g.gestion} className="text-center font-semibold">{g.totalObjetivos}</td>
                  ))}
                  {data.length >= 2 && (
                    <td className="text-center">
                      <DeltaBadge current={data[data.length-1].totalObjetivos} previous={data[data.length-2].totalObjetivos} />
                    </td>
                  )}
                </tr>
                <tr>
                  <td className="py-2.5 text-gray-700">Objetivos completados</td>
                  {data.map((g) => (
                    <td key={g.gestion} className="text-center font-semibold">{g.objetivosCompletados}</td>
                  ))}
                  {data.length >= 2 && (
                    <td className="text-center">
                      <DeltaBadge current={data[data.length-1].objetivosCompletados} previous={data[data.length-2].objetivosCompletados} />
                    </td>
                  )}
                </tr>
                <tr>
                  <td className="py-2.5 text-gray-700">Actividades totales</td>
                  {data.map((g) => (
                    <td key={g.gestion} className="text-center font-semibold">{g.totalActividades}</td>
                  ))}
                  {data.length >= 2 && (
                    <td className="text-center">
                      <DeltaBadge current={data[data.length-1].totalActividades} previous={data[data.length-2].totalActividades} />
                    </td>
                  )}
                </tr>
                <tr>
                  <td className="py-2.5 text-gray-700">Actividades terminadas</td>
                  {data.map((g) => (
                    <td key={g.gestion} className="text-center">
                      <span className="text-green-700 font-semibold">{g.actividadesTerminadas}</span>
                      <span className="text-gray-400 text-xs ml-1">/ {g.totalActividades}</span>
                    </td>
                  ))}
                  {data.length >= 2 && (
                    <td className="text-center">
                      <DeltaBadge current={data[data.length-1].actividadesTerminadas} previous={data[data.length-2].actividadesTerminadas} />
                    </td>
                  )}
                </tr>
                <tr>
                  <td className="py-2.5 text-gray-700">En curso</td>
                  {data.map((g) => (
                    <td key={g.gestion} className="text-center font-semibold text-yellow-600">{g.actividadesEnCurso}</td>
                  ))}
                  {data.length >= 2 && <td></td>}
                </tr>
                <tr>
                  <td className="py-2.5 text-gray-700">Pendientes</td>
                  {data.map((g) => (
                    <td key={g.gestion} className="text-center font-semibold text-gray-500">{g.actividadesPendientes}</td>
                  ))}
                  {data.length >= 2 && <td></td>}
                </tr>
                <tr>
                  <td className="py-2.5 text-gray-700">KPIs definidos</td>
                  {data.map((g) => (
                    <td key={g.gestion} className="text-center font-semibold">{g.totalKpis}</td>
                  ))}
                  {data.length >= 2 && (
                    <td className="text-center">
                      <DeltaBadge current={data[data.length-1].totalKpis} previous={data[data.length-2].totalKpis} />
                    </td>
                  )}
                </tr>
                <tr className="border-t-2">
                  <td className="py-3 font-semibold text-gray-900">Progreso General</td>
                  {data.map((g) => (
                    <td key={g.gestion} className="text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              g.progresoGeneral >= 80 ? "bg-green-500" :
                              g.progresoGeneral >= 50 ? "bg-yellow-500" :
                              "bg-red-400"
                            }`}
                            style={{ width: `${g.progresoGeneral}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900">{g.progresoGeneral}%</span>
                      </div>
                    </td>
                  ))}
                  {data.length >= 2 && (
                    <td className="text-center">
                      <DeltaBadge
                        current={data[data.length-1].progresoGeneral}
                        previous={data[data.length-2].progresoGeneral}
                        suffix="%"
                      />
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary insight */}
          {data.length >= 2 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Resumen:</strong>{" "}
                {data[data.length-1].progresoGeneral >= data[data.length-2].progresoGeneral
                  ? `La gestión ${data[data.length-1].gestion} va en buen camino con ${data[data.length-1].progresoGeneral}% de avance.`
                  : `La gestión ${data[data.length-1].gestion} tiene ${data[data.length-1].progresoGeneral}% de avance vs ${data[data.length-2].progresoGeneral}% de la gestión anterior (al cierre).`
                }
                {" "}Tienes {data[data.length-1].actividadesPendientes} actividades pendientes y {data[data.length-1].actividadesEnCurso} en curso.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DeltaBadge({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  const delta = current - previous;
  if (delta === 0) return <span className="text-xs text-gray-400">—</span>;

  const isPositive = delta > 0;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
      isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      {isPositive ? "↑" : "↓"} {Math.abs(delta)}{suffix}
    </span>
  );
}
