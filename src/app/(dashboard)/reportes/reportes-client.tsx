"use client";

import { useState } from "react";

type TipoReporte = "progreso" | "poa" | "kpis";

interface Props {
  userRole: string;
}

export function ReportesClient({ userRole }: Props) {
  const [tipo, setTipo] = useState<TipoReporte>("progreso");
  const [gestion, setGestion] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateReport() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const params = new URLSearchParams({ tipo });
      if (gestion) params.set("gestion", gestion);

      const res = await fetch(`/api/reportes?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error al generar reporte");
        return;
      }
      const result = await res.json();
      setData(result);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg border p-4 print:hidden">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tipo de Reporte
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoReporte)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700"
            >
              <option value="progreso">Progreso por Gestion</option>
              <option value="poa">Cumplimiento POA</option>
              <option value="kpis">Indicadores KPIs</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Gestion (opcional)
            </label>
            <input
              type="text"
              value={gestion}
              onChange={(e) => setGestion(e.target.value)}
              placeholder="Ej: 2024"
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 w-32"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </button>
          {data && (
            <button
              onClick={handlePrint}
              className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
            >
              🖨️ Imprimir / PDF
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Report content */}
      {data && (
        <div className="bg-white rounded-lg border p-6 print:border-0 print:shadow-none" id="report-content">
          {/* Report header */}
          <div className="border-b pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {tipo === "progreso" && "Reporte de Progreso por Gestion"}
              {tipo === "poa" && "Reporte de Cumplimiento POA"}
              {tipo === "kpis" && "Reporte de Indicadores KPI"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestion: {data.gestion} | Generado: {new Date(data.generadoEn).toLocaleString("es")}
            </p>
          </div>

          {/* Progreso report */}
          {tipo === "progreso" && data.resumen && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-xl font-bold">{data.resumen.totalObjetivos}</p>
                  <p className="text-xs text-gray-500">Total Objetivos</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <p className="text-xl font-bold text-green-700">{data.resumen.completados}</p>
                  <p className="text-xs text-green-600">Completados</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <p className="text-xl font-bold text-blue-700">{data.resumen.enProgreso}</p>
                  <p className="text-xs text-blue-600">En Progreso</p>
                </div>
                <div className="text-center p-3 bg-violet-50 rounded">
                  <p className="text-xl font-bold text-violet-700">{data.resumen.porcentajeGeneral}%</p>
                  <p className="text-xs text-violet-600">Cumplimiento</p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-600">Objetivo</th>
                    <th className="text-left py-2 text-gray-600">Responsable</th>
                    <th className="text-left py-2 text-gray-600">Estado</th>
                    <th className="text-right py-2 text-gray-600">Actividades</th>
                  </tr>
                </thead>
                <tbody>
                  {data.objetivos?.map((obj: any) => (
                    <tr key={obj.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{obj.titulo}</td>
                      <td className="py-2 text-gray-600">{obj.responsable}</td>
                      <td className="py-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {obj.estado}
                        </span>
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {obj.actividades.completadas}/{obj.actividades.total} ({obj.actividades.porcentaje}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* POA report */}
          {tipo === "poa" && (
            <div className="space-y-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-600">Objetivo</th>
                    <th className="text-left py-2 text-gray-600">Responsable</th>
                    <th className="text-right py-2 text-gray-600">Completadas</th>
                    <th className="text-right py-2 text-gray-600">En Curso</th>
                    <th className="text-right py-2 text-gray-600">Pendientes</th>
                    <th className="text-right py-2 text-gray-600">Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {data.objetivos?.map((obj: any) => (
                    <tr key={obj.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{obj.titulo}</td>
                      <td className="py-2 text-gray-600">{obj.responsable}</td>
                      <td className="py-2 text-right text-green-600">{obj.cumplimiento.completadas}</td>
                      <td className="py-2 text-right text-blue-600">{obj.cumplimiento.enCurso}</td>
                      <td className="py-2 text-right text-yellow-600">{obj.cumplimiento.pendientes}</td>
                      <td className="py-2 text-right font-medium">{obj.cumplimiento.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* KPIs report */}
          {tipo === "kpis" && data.resumen && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-xl font-bold">{data.resumen.totalKpis}</p>
                  <p className="text-xs text-gray-500">Total KPIs</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <p className="text-xl font-bold text-green-700">{data.resumen.verdes}</p>
                  <p className="text-xs text-green-600">Verde</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <p className="text-xl font-bold text-yellow-700">{data.resumen.amarillos}</p>
                  <p className="text-xs text-yellow-600">Amarillo</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <p className="text-xl font-bold text-red-700">{data.resumen.rojos}</p>
                  <p className="text-xs text-red-600">Rojo</p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-600">KPI</th>
                    <th className="text-left py-2 text-gray-600">Objetivo</th>
                    <th className="text-left py-2 text-gray-600">Responsable</th>
                    <th className="text-right py-2 text-gray-600">Meta</th>
                    <th className="text-right py-2 text-gray-600">Actual</th>
                    <th className="text-right py-2 text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.kpis?.map((kpi: any) => (
                    <tr key={kpi.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{kpi.nombre}</td>
                      <td className="py-2 text-gray-600 text-xs">{kpi.objetivo}</td>
                      <td className="py-2 text-gray-600">{kpi.responsable}</td>
                      <td className="py-2 text-right">{kpi.meta}</td>
                      <td className="py-2 text-right">{kpi.valorActual}</td>
                      <td className="py-2 text-right">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            kpi.semaforo === "verde"
                              ? "bg-green-100 text-green-700"
                              : kpi.semaforo === "amarillo"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {kpi.porcentaje}% {kpi.semaforo === "verde" ? "🟢" : kpi.semaforo === "amarillo" ? "🟡" : "🔴"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
