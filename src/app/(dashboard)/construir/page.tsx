"use client";

import { useState } from "react";

export default function ConstruirPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/lineamientos", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al generar lineamientos");
      } else {
        setResult(data);
      }
    } catch {
      setError("Error de conexión. Verifica que el proveedor IA está configurado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          🏗️ Construye tus Lineamientos
        </h1>
        <p className="text-gray-600 mt-2">
          El sistema analizará los documentos organizacionales (PEI, FODA, MOF) 
          y generará objetivos estratégicos, KPIs y actividades personalizadas 
          para tu cargo.
        </p>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Requisitos:</strong> Debes tener al menos un documento (PEI o FODA) 
            cargado en la sección de Documentos, y un proveedor IA configurado.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-6 py-3 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Generando lineamientos...
            </>
          ) : (
            <>🤖 Generar con IA</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              ✅ Lineamientos Generados
            </h2>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
              Generado por IA — revisa y edita
            </span>
          </div>

          {result.objetivos?.map((obj: any, i: number) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">
                {i + 1}. {obj.titulo}
              </h3>
              <p className="text-sm text-gray-600">{obj.descripcion}</p>
              <p className="text-xs text-blue-600">
                📎 Alineamiento PEI: {obj.alineamiento_pei}
              </p>

              {obj.kpis && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 uppercase">KPIs:</p>
                  <ul className="mt-1 space-y-1">
                    {obj.kpis.map((kpi: any, j: number) => (
                      <li key={j} className="text-sm text-gray-700 pl-4 border-l-2 border-green-300">
                        {kpi.nombre}: {kpi.meta} ({kpi.frecuencia})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {obj.actividades && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 uppercase">Actividades:</p>
                  <ul className="mt-1 space-y-1">
                    {obj.actividades.map((act: any, j: number) => (
                      <li key={j} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          act.plazo_dias === "30" ? "bg-green-100 text-green-700" :
                          act.plazo_dias === "60" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {act.plazo_dias}d
                        </span>
                        {act.descripcion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors">
            ✅ Confirmar y Guardar Lineamientos
          </button>
        </div>
      )}
    </div>
  );
}
