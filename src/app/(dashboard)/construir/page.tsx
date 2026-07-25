"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DocItem {
  id: string;
  name: string;
  type: string;
  hasContent: boolean;
  contentLength: number;
}

export default function ConstruirPage() {
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"patterns" | "ai">("patterns");
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  // Load documents from DB
  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/docs");
      const data = await res.json();
      if (res.ok && data.documents) {
        const withContent = data.documents.filter((d: DocItem) => d.hasContent);
        setDocs(withContent);
        // Select all by default
        setSelectedDocs(withContent.map((d: DocItem) => d.id));
      }
    } catch {} finally {
      setLoadingDocs(false);
    }
  };

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async () => {
    if (selectedDocs.length === 0) {
      setError("Selecciona al menos un documento.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Fetch content of all selected documents
      const contents: string[] = [];
      const names: string[] = [];

      for (const docId of selectedDocs) {
        const res = await fetch(`/api/docs/${docId}/content`);
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            contents.push(data.content);
            names.push(data.name);
          }
        }
      }

      const fullText = contents.join("\n\n---\n\n");

      if (fullText.length < 50) {
        setError("Los documentos seleccionados no tienen suficiente contenido.");
        setLoading(false);
        return;
      }

      // Send to analyze endpoint
      const res = await fetch("/api/docs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullText,
          documentName: names.join(", "),
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

  const hasDocs = docs.length > 0;
  const hasSelection = selectedDocs.length > 0;

  if (loadingDocs) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Cargando documentos...</p>
      </div>
    );
  }

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

      {/* No docs */}
      {!hasDocs && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <span className="text-4xl block mb-3">📄</span>
          <h3 className="font-semibold text-gray-900">
            No hay documentos cargados
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Carga al menos un documento para poder analizarlo.
          </p>
          <Link
            href="/documentos"
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
          >
            📄 Ir a cargar documentos →
          </Link>
        </div>
      )}

      {/* Has docs */}
      {hasDocs && (
        <>
          {/* Doc list */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-gray-900 mb-3">
              📄 Documentos disponibles
            </h2>
            <div className="space-y-2">
              {docs.map((doc) => (
                <label
                  key={doc.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDocs.includes(doc.id)
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => toggleDoc(doc.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-lg">
                    {doc.type === "PEI" ? "📕" : doc.type === "FODA" ? "📊" :
                     doc.type === "MOF" ? "📘" : doc.type === "POI" ? "📗" : "📄"}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {doc.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {(doc.contentLength / 1024).toFixed(1)} KB
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Mode + Action */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Método de análisis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setMode("patterns")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  mode === "patterns" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">🔍</span>
                <h3 className="font-semibold text-gray-900 mt-1">Sin IA</h3>
                <p className="text-xs text-gray-600 mt-1">Detecta patrones automáticamente</p>
                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✅ Siempre disponible</span>
              </button>
              <button
                onClick={() => setMode("ai")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  mode === "ai" ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">🤖</span>
                <h3 className="font-semibold text-gray-900 mt-1">Con IA</h3>
                <p className="text-xs text-gray-600 mt-1">Genera lineamientos completos</p>
                <span className="inline-block mt-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">Con IA (requiere proveedor configurado)</span>
              </button>
            </div>

            {mode === "patterns" ? (
              <button
                onClick={handleAnalyze}
                disabled={loading || !hasSelection}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "⏳ Analizando..." : `🔍 Analizar ${selectedDocs.length} documento${selectedDocs.length !== 1 ? "s" : ""}`}
              </button>
            ) : (
              <button
                onClick={handleGenerateAI}
                disabled={loading}
                className="w-full bg-violet-600 text-white font-medium py-3 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "⏳ Generando..." : "🤖 Generar con IA"}
              </button>
            )}
          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      )}

      {/* Results */}
      {result && !result.fromAI && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">📊 Resultados</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Análisis por patrones</span>
          </div>
          <p className="text-sm text-gray-600">{result.resumen}</p>

          {result.objetivos?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Objetivos ({result.objetivos.length})</h3>
              <div className="space-y-3">
                {result.objetivos.map((obj: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <span className={`text-xs px-2 py-0.5 rounded ${obj.tipo === "estratégico" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{obj.tipo}</span>
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
              <h3 className="font-semibold text-gray-900 mb-3">📈 KPIs ({result.kpis.length})</h3>
              <div className="space-y-3">
                {result.kpis.map((kpi: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">{kpi.nomenclatura}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{kpi.perspectiva}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">{kpi.nombre}</p>
                    {kpi.formula && <p className="text-xs font-mono bg-gray-50 px-2 py-1 rounded mt-2">{kpi.formula}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(result.objetivos?.length > 0 || result.kpis?.length > 0) && (
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/docs/analyze/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ objetivos: result.objetivos, kpis: result.kpis }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`✅ ${data.message}`);
                    } else {
                      alert(data.error || "Error al guardar");
                    }
                  } catch {
                    alert("Error de conexión");
                  }
                }}
                className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                💾 Guardar como mis lineamientos
              </button>
              <button
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  if (!printWindow) return;
                  const html = `
                    <html><head><title>Análisis - Incorporated</title>
                    <style>
                      body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
                      h1 { font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                      h2 { font-size: 18px; color: #1e40af; margin-top: 30px; }
                      h3 { font-size: 14px; color: #374151; margin-top: 20px; }
                      .obj { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0; }
                      .tipo { display: inline-block; font-size: 11px; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; }
                      .kpi { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; margin: 8px 0; }
                      .formula { font-family: monospace; background: #f9fafb; padding: 8px; border-radius: 4px; font-size: 12px; }
                      .act { font-size: 13px; color: #4b5563; padding: 4px 0; }
                      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
                      @media print { body { padding: 20px; } }
                    </style></head><body>
                    <h1>📊 Análisis de Lineamientos</h1>
                    <p style="color:#6b7280;font-size:14px;">${result.resumen || ""}</p>
                    ${result.objetivos?.length ? `
                      <h2>🎯 Objetivos Detectados (${result.objetivos.length})</h2>
                      ${result.objetivos.map((obj: any, i: number) => `
                        <div class="obj">
                          <span class="tipo">${obj.tipo}</span>
                          <h3>${i+1}. ${obj.titulo}</h3>
                          ${obj.actividades?.length ? `<div style="margin-top:8px;padding-left:16px;border-left:3px solid #93c5fd;">
                            ${obj.actividades.map((a: string) => `<p class="act">• ${a}</p>`).join("")}
                          </div>` : ""}
                        </div>
                      `).join("")}
                    ` : ""}
                    ${result.kpis?.length ? `
                      <h2>📈 KPIs Detectados (${result.kpis.length})</h2>
                      ${result.kpis.map((kpi: any) => `
                        <div class="kpi">
                          <strong>${kpi.nomenclatura}</strong> — ${kpi.nombre}
                          <br/><span style="font-size:12px;color:#6b7280;">Perspectiva: ${kpi.perspectiva}</span>
                          ${kpi.formula ? `<div class="formula">Fórmula: ${kpi.formula}</div>` : ""}
                        </div>
                      `).join("")}
                    ` : ""}
                    <div class="footer">Generado por Incorporated — ${new Date().toLocaleDateString()}</div>
                    </body></html>
                  `;
                  printWindow.document.write(html);
                  printWindow.document.close();
                  setTimeout(() => printWindow.print(), 500);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                🖨️ Imprimir
              </button>
            </div>
          )}
        </div>
      )}

      {result && result.fromAI && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">✅ Generado por IA</h2>
          {result.objetivos?.map((obj: any, i: number) => (
            <div key={i} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{i + 1}. {obj.titulo}</h3>
              <p className="text-sm text-gray-600 mt-1">{obj.descripcion}</p>
            </div>
          ))}
          <button className="w-full bg-violet-600 text-white font-medium py-3 rounded-md hover:bg-violet-700 transition-colors">✅ Confirmar</button>
        </div>
      )}
    </div>
  );
}
