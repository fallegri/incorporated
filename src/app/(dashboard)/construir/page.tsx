"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ConstruirPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState<"patterns" | "ai">("patterns");
  const [savedDocs, setSavedDocs] = useState<string[]>([]);

  // Load any previously saved documents from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("incorporated_docs");
      if (stored) {
        const docs = JSON.parse(stored);
        setSavedDocs(docs.map((d: any) => d.name));
        // Auto-load the most recent document content
        const lastDoc = docs[docs.length - 1];
        if (lastDoc?.content && !textInput) {
          setTextInput(lastDoc.content);
        }
      }
    } catch {}
  }, []);

  const handleAnalyzeText = async () => {
    const text = textInput.trim();
    if (!text || text.length < 50) {
      setError("El texto debe tener al menos 50 caracteres para analizar.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/docs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, documentName: "Documento" }),
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

  const canAnalyze = textInput.trim().length >= 50;

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

      {/* Show if docs are available from previous upload */}
      {savedDocs.length > 0 && textInput.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✅ Se cargó automáticamente el contenido de: <strong>{savedDocs[savedDocs.length - 1]}</strong>
          </p>
        </div>
      )}

      {/* Mode selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          ¿Cómo quieres construir tus lineamientos?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Detecta objetivos, KPIs y actividades usando 
              reconocimiento de patrones. <strong>No requiere IA.</strong>
            </p>
            <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              ✅ Siempre disponible
            </span>
          </button>

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
              La IA genera objetivos, KPIs y plan 30/60/90 personalizado.
            </p>
            <span className="inline-block mt-3 text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
              🤖 Requiere Gemini u Ollama
            </span>
          </button>
        </div>
      </div>

      {/* Mode: Pattern Analysis */}
      {mode === "patterns" && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            📋 Contenido del documento a analizar
          </h2>
          <p className="text-sm text-gray-600">
            {textInput.length > 0
              ? "El contenido de tu documento está listo. Puedes editarlo o analizarlo directamente."
              : "Pega el texto de tu PEI, FODA o documento estratégico. Si ya cargaste un documento en la sección anterior, el contenido aparecerá aquí automáticamente."
            }
          </p>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
            placeholder={"Pega aquí el contenido de tu documento...\n\nEjemplo:\nObjetivos Estratégicos:\n· Potenciar la captación de estudiantes\n· Consolidar la retención estudiantil\n\nKPIs:\nNomenclatura: ISE\nNombre: Índice de Satisfacción Estudiantil\nFórmula: (Reclamos / Histórico) * 100"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {textInput.length} caracteres
              {textInput.length > 0 && textInput.length < 50 && (
                <span className="text-amber-600 ml-2">— necesitas al menos 50</span>
              )}
              {canAnalyze && (
                <span className="text-green-600 ml-2">— ✅ listo para analizar</span>
              )}
            </div>
            <button
              onClick={handleAnalyzeText}
              disabled={loading || !canAnalyze}
              className={`inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-md transition-colors ${
                canAnalyze
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              } disabled:opacity-50`}
            >
              {loading ? (
                <><span className="animate-spin">⏳</span> Analizando...</>
              ) : (
                <>🔍 Analizar documento</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode: AI Generation */}
      {mode === "ai" && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            🤖 Generar lineamientos con IA
          </h2>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Requisitos:</strong> Proveedor IA configurado (Gemini u Ollama).
            </p>
          </div>
          <button
            onClick={handleGenerateAI}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-6 py-3 rounded-md hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <><span className="animate-spin">⏳</span> Generando...</>
            ) : (
              <>🤖 Generar con IA</>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Results: Pattern Analysis */}
      {result && !result.fromAI && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">📊 Resultados</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Sin IA — Patrones
            </span>
          </div>
          <p className="text-sm text-gray-600">{result.resumen}</p>

          {result.objetivos?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                🎯 Objetivos ({result.objetivos.length})
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
                      }`}>{obj.confidence}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">{obj.titulo}</p>
                    {obj.actividades?.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-blue-200 space-y-0.5">
                        {obj.actividades.map((act: string, j: number) => (
                          <p key={j} className="text-xs text-gray-600">• {act}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.kpis?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                📈 KPIs ({result.kpis.length})
              </h3>
              <div className="space-y-3">
                {result.kpis.map((kpi: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">{kpi.nomenclatura}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{kpi.perspectiva}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">{kpi.nombre}</p>
                    {kpi.formula && (
                      <p className="text-xs font-mono bg-gray-50 px-2 py-1 rounded mt-2">{kpi.formula}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(result.objetivos?.length > 0 || result.kpis?.length > 0) && (
            <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors">
              ✅ Guardar como mis lineamientos
            </button>
          )}

          {(!result.objetivos?.length && !result.kpis?.length) && (
            <div className="text-center py-6 text-gray-400">
              <p>No se detectaron patrones. Intenta con más contenido del documento.</p>
            </div>
          )}
        </div>
      )}

      {/* Results: AI */}
      {result && result.fromAI && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">✅ Generado por IA</h2>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">IA</span>
          </div>
          {result.objetivos?.map((obj: any, i: number) => (
            <div key={i} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{i + 1}. {obj.titulo}</h3>
              <p className="text-sm text-gray-600 mt-1">{obj.descripcion}</p>
            </div>
          ))}
          <button className="w-full bg-violet-600 text-white font-medium py-3 rounded-md hover:bg-violet-700 transition-colors">
            ✅ Confirmar lineamientos
          </button>
        </div>
      )}
    </div>
  );
}
