"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StoredDoc {
  name: string;
  type: string;
  content: string;
}

export default function ConstruirPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"patterns" | "ai">("patterns");
  const [storedDocs, setStoredDocs] = useState<StoredDoc[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  // Load documents from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("incorporated_docs");
      if (stored) {
        const docs = JSON.parse(stored) as StoredDoc[];
        const withContent = docs.filter((d) => d.content && d.content.length > 0);
        setStoredDocs(withContent);
        // Select all by default
        setSelectedDocs(withContent.map((_, i) => i));
      }
    } catch {}
  }, []);

  const toggleDoc = (index: number) => {
    setSelectedDocs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getSelectedText = (): string => {
    return selectedDocs
      .map((i) => storedDocs[i]?.content || "")
      .join("\n\n")
      .trim();
  };

  const handleAnalyze = async () => {
    const text = getSelectedText();
    if (!text || text.length < 50) {
      setError("No hay contenido suficiente para analizar. Carga documentos primero.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/docs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          documentName: selectedDocs.map((i) => storedDocs[i]?.name).join(", "),
        }),
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
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const hasDocs = storedDocs.length > 0;
  const hasSelection = selectedDocs.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          🏗️ Construye tus Lineamientos
        </h1>
        <p className="text-gray-600 mt-2">
          Extrae objetivos estratégicos, KPIs y actividades de tus documentos.
        </p>
      </div>

      {/* No docs loaded */}
      {!hasDocs && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <span className="text-4xl block mb-3">📄</span>
          <h3 className="font-semibold text-gray-900">
            No hay documentos cargados
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Primero debes cargar al menos un documento (PEI, FODA, MOF u otro) 
            en la sección de Documentos.
          </p>
          <Link
            href="/documentos"
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
          >
            📄 Ir a cargar documentos →
          </Link>
        </div>
      )}

      {/* Docs loaded — show list + mode selection */}
      {hasDocs && (
        <>
          {/* Documents loaded */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-gray-900 mb-3">
              📄 Documentos disponibles
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Selecciona los documentos que quieres analizar:
            </p>
            <div className="space-y-2">
              {storedDocs.map((doc, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDocs.includes(i)
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(i)}
                    onChange={() => toggleDoc(i)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {doc.name}
                    </span>
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {doc.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {(doc.content.length / 1024).toFixed(1)} KB
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Mode selector */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Método de análisis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("patterns")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  mode === "patterns"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">🔍</span>
                <h3 className="font-semibold text-gray-900 mt-1">Sin IA</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Detecta patrones automáticamente
                </p>
                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  ✅ Siempre disponible
                </span>
              </button>

              <button
                onClick={() => setMode("ai")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  mode === "ai"
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">🤖</span>
                <h3 className="font-semibold text-gray-900 mt-1">Con IA</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Genera lineamientos completos
                </p>
                <span className="inline-block mt-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                  Requiere Gemini/Ollama
                </span>
              </button>
            </div>

            {/* Action button */}
            <div className="mt-6">
              {mode === "patterns" ? (
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !hasSelection}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <><span className="animate-spin">⏳</span> Analizando...</>
                  ) : (
                    <>🔍 Analizar {selectedDocs.length} documento{selectedDocs.length !== 1 ? "s" : ""}</>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleGenerateAI}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 text-white font-medium px-6 py-3 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <><span className="animate-spin">⏳</span> Generando...</>
                  ) : (
                    <>🤖 Generar con IA</>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
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
            <h2 className="text-xl font-bold text-gray-900">📊 Resultados</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Análisis por patrones
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
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">{obj.titulo}</p>
                    {obj.actividades?.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-blue-200 space-y-0.5">
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
              <p>No se detectaron patrones reconocibles.</p>
              <p className="text-sm mt-1">Intenta cargando un documento con objetivos o KPIs más estructurados.</p>
            </div>
          )}
        </div>
      )}

      {/* AI Results */}
      {result && result.fromAI && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">✅ Generado por IA</h2>
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
