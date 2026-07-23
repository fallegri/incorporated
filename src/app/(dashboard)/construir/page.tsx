"use client";

import { useState } from "react";
import Link from "next/link";

export default function ConstruirPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState<"patterns" | "ai">("patterns");

  const handleAnalyzeText = async () => {
    if (!textInput.trim() || textInput.trim().length < 50) {
      setError("Pega al menos 50 caracteres de tu documento para analizar.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/docs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput, documentName: "Documento" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al analizar");
      } else {
        setResult(data);
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/lineamientos", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al generar con IA");
      } else {
        setResult({ ...data, fromAI: true });
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
          Analiza tus documentos para extraer objetivos estratégicos, KPIs y 
          actividades. Puedes hacerlo <strong>con IA</strong> o <strong>sin IA</strong>.
        </p>
      </div>

      {/* Mode selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          ¿Cómo quieres construir tus lineamientos?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Pattern analysis (no AI) */}
          <button
            onClick={() => setMode("patterns")}
            className={`p-5 border-2 rounded-lg text-left transition-colors ${
              mode === "patterns"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔍</span>
              <h3 className="font-semibold text-gray-900">Análisis por patrones</h3>
            </div>
            <p className="text-sm text-gray-600">
              Detecta automáticamente objetivos, KPIs y actividades en tus documentos 
              usando reconocimiento de patrones. <strong>No requiere IA.</strong>
            </p>
            <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              ✅ Siempre disponible
            </span>
          </button>

          {/* Option 2: AI generation */}
          <button
            onClick={() => setMode("ai")}
            className={`p-5 border-2 rounded-lg text-left transition-colors ${
              mode === "ai"
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🤖</span>
              <h3 className="font-semibold text-gray-900">Generación con IA</h3>
            </div>
            <p className="text-sm text-gray-600">
              La IA analiza tus documentos y genera objetivos estratégicos, KPIs 
              y un plan 30/60/90 días personalizado.
            </p>
            <span className="inline-block mt-3 text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
              🤖 Requiere Gemini u Ollama configurado
            </span>
          </button>
        </div>
      </div>

      {/* Mode: Pattern Analysis */}
      {mode === "patterns" && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            📋 Pega el contenido de tu documento
          </h2>
          <p className="text-sm text-gray-600">
            Copia y pega el texto de tu PEI, FODA, plan estratégico o cualquier 
            documento con objetivos y KPIs. El sistema los detectará automáticamente.
          </p>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={12}
            placeholder="Pega aquí el contenido de tu documento estratégico...&#10;&#10;Ejemplo:&#10;Objetivos Estratégicos:&#10;· Potenciar la captación de estudiantes&#10;· Consolidar la retención estudiantil&#10;&#10;KPIs:&#10;Nomenclatura: ISE&#10;Nombre: Índice de Satisfacción Estudiantil&#10;Fórmula: (Reclamos / Histórico) * 100&#10;..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {textInput.length > 0 ? `${textInput.length} caracteres` : "Mínimo 50 caracteres"}
            </p>
            <div className="flex gap-2">
              <Link
                href="/documentos"
                className="text-sm text-blue-600 hover:text-blue-700 px-3 py-2"
              >
                O sube un archivo →
              </Link>
              <button
                onClick={handleAnalyzeText}
                disabled={loading || textInput.trim().length < 50}
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <><span className="animate-spin">⏳</span> Analizando...</>
                ) : (
                  <>🔍 Analizar documento</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode: AI Generation */}
      {mode === "ai" && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            🤖 Generar lineamientos con IA
          </h2>
          <p className="text-sm text-gray-600">
            El sistema utilizará inteligencia artificial para analizar los documentos 
            cargados y generar objetivos estratégicos, KPIs y un plan de inserción.
          </p>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Requisitos:</strong>
            </p>
            <ul className="text-sm text-amber-700 mt-1 list-disc pl-5 space-y-1">
              <li>Tener al menos un documento cargado en la sección de Documentos</li>
              <li>Tener un proveedor IA configurado (Gemini u Ollama)</li>
            </ul>
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-6 py-3 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <><span className="animate-spin">⏳</span> Generando...</>
            ) : (
              <>🤖 Generar con IA</>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !result.fromAI && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              📊 Resultados del Análisis
            </h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Sin IA — Detección por patrones
            </span>
          </div>

          <p className="text-sm text-gray-600">{result.resumen}</p>

          {/* Objectives */}
          {result.objetivos?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                🎯 Objetivos Detectados ({result.objetivos.length})
              </h3>
              <div className="space-y-3">
                {result.objetivos.map((obj: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        obj.tipo === "estratégico" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}>{obj.tipo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        obj.confidence === "alta" ? "bg-green-100 text-green-700" :
                        obj.confidence === "media" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>Confianza: {obj.confidence}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">{obj.titulo}</p>
                    {obj.actividades?.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-blue-200">
                        <p className="text-xs text-gray-500 mb-1">Actividades asociadas:</p>
                        {obj.actividades.map((act: string, j: number) => (
                          <p key={j} className="text-xs text-gray-600 py-0.5">• {act}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs */}
          {result.kpis?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                📈 KPIs Detectados ({result.kpis.length})
              </h3>
              <div className="space-y-3">
                {result.kpis.map((kpi: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">
                        {kpi.nomenclatura}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Perspectiva: {kpi.perspectiva}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">{kpi.nombre}</p>
                    {kpi.objetivo && (
                      <p className="text-xs text-gray-600 mt-1">📎 {kpi.objetivo}</p>
                    )}
                    {kpi.formula && (
                      <div className="mt-2 bg-gray-50 px-3 py-2 rounded font-mono text-xs text-gray-700">
                        Fórmula: {kpi.formula}
                      </div>
                    )}
                    {kpi.condiciones?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {kpi.condiciones.map((c: any, j: number) => (
                          <span key={j} className={`text-xs px-2 py-0.5 rounded ${
                            c.label === "Óptimo" ? "bg-green-50 text-green-700 border border-green-200" :
                            c.label === "Aceptable" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                            "bg-red-50 text-red-700 border border-red-200"
                          }`}>{c.label}: {c.valor}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lineamientos */}
          {result.lineamientos?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                📜 Lineamientos por Perspectiva ({result.lineamientos.length})
              </h3>
              <div className="space-y-3">
                {result.lineamientos.map((lin: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900">{lin.titulo}</p>
                    <p className="text-xs text-gray-500 mt-1">{lin.descripcion}</p>
                    {lin.objetivos_asociados?.length > 0 && (
                      <ul className="mt-2 space-y-1 pl-4">
                        {lin.objetivos_asociados.map((obj: string, j: number) => (
                          <li key={j} className="text-xs text-gray-600 list-disc">{obj}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {(!result.objetivos?.length && !result.kpis?.length && !result.lineamientos?.length) && (
            <div className="text-center py-6 text-gray-400">
              <p>No se detectaron patrones conocidos en el texto.</p>
              <p className="text-sm mt-1">
                Intenta con un documento que contenga objetivos, KPIs o perspectivas estratégicas.
              </p>
            </div>
          )}

          {/* Save button */}
          {(result.objetivos?.length > 0 || result.kpis?.length > 0) && (
            <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors">
              ✅ Guardar como mis lineamientos
            </button>
          )}
        </div>
      )}

      {/* AI Results */}
      {result && result.fromAI && (
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
              {obj.alineamiento_pei && (
                <p className="text-xs text-blue-600">
                  📎 Alineamiento PEI: {obj.alineamiento_pei}
                </p>
              )}
              {obj.kpis?.length > 0 && (
                <div className="pl-4 border-l-2 border-green-200">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">KPIs:</p>
                  {obj.kpis.map((kpi: any, j: number) => (
                    <p key={j} className="text-sm text-gray-700">
                      • {kpi.nombre}: {kpi.meta} ({kpi.frecuencia})
                    </p>
                  ))}
                </div>
              )}
              {obj.actividades?.length > 0 && (
                <div className="pl-4 border-l-2 border-amber-200">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Actividades:</p>
                  {obj.actividades.map((act: any, j: number) => (
                    <p key={j} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        act.plazo_dias === "30" ? "bg-green-100 text-green-700" :
                        act.plazo_dias === "60" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>{act.plazo_dias}d</span>
                      {act.descripcion}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors">
            ✅ Confirmar y guardar lineamientos
          </button>
        </div>
      )}
    </div>
  );
}
