"use client";

import { useState } from "react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
  "text/markdown",
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.xlsx,.xls,.txt,.md";

const FILE_ICONS: Record<string, string> = {
  pdf: "📕",
  doc: "📘",
  docx: "📘",
  xlsx: "📗",
  xls: "📗",
  txt: "📄",
  md: "📝",
  text: "✏️",
};

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || "📄";
}

function getFileExtension(name: string): string {
  return name.split(".").pop()?.toUpperCase() || "—";
}

export default function DocumentosPage() {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [docType, setDocType] = useState("OTRO");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async (text: string, name: string) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/docs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, documentName: name }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data);
      } else {
        alert(data.error || "Error al analizar");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["pdf", "doc", "docx", "xlsx", "xls", "txt", "md"];
    if (!validExts.includes(ext || "")) {
      alert("Formato no soportado. Usa: PDF, Word, Excel, TXT o Markdown.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("El archivo excede el límite de 20MB.");
      return;
    }

    setUploading(true);
    // TODO: Implement actual upload to Vercel Blob + processing pipeline
    setTimeout(() => {
      setDocuments((prev) => [
        ...prev,
        {
          name: file.name,
          type: docType,
          format: ext?.toUpperCase(),
          status: "UPLOADED",
          size: (file.size / 1024).toFixed(1) + " KB",
          createdAt: new Date(),
        },
      ]);
      setUploading(false);
      setDocType("OTRO");
    }, 1500);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim() || !textTitle.trim()) {
      alert("Ingresa un título y el contenido del texto.");
      return;
    }

    const newDoc = {
      name: textTitle.trim(),
      type: docType,
      format: "TEXTO",
      status: "UPLOADED",
      size: (textInput.length / 1024).toFixed(1) + " KB",
      content: textInput,
      createdAt: new Date(),
    };

    setDocuments((prev) => {
      const updated = [...prev, newDoc];
      // Save to localStorage for /construir page to access
      try {
        localStorage.setItem("incorporated_docs", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Auto-analyze pasted text
    handleAnalyze(textInput, textTitle.trim());
    setTextInput("");
    setTextTitle("");
    setShowTextInput(false);
    setDocType("OTRO");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">📄 Documentos</h1>
        <p className="text-gray-600 mt-1">
          Sube documentos organizacionales para que el asistente IA los
          analice y genere lineamientos.
        </p>
      </div>

      {/* Document type selector */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de documento
        </label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="PEI">PEI — Plan Estratégico Institucional</option>
          <option value="FODA">FODA — Análisis Estratégico</option>
          <option value="MOF">MOF — Manual de Organización y Funciones</option>
          <option value="POI">POI — Plan Operativo Institucional</option>
          <option value="OTRO">Otro documento</option>
        </select>
      </div>

      {/* Upload methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File upload */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-3">📎 Subir archivo</h3>
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <span className="text-3xl block mb-2">
                {uploading ? "⏳" : "📁"}
              </span>
              <p className="text-sm text-gray-600">
                {uploading
                  ? "Subiendo..."
                  : "Click o arrastra un archivo"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, Word, Excel, TXT, Markdown (máx. 20MB)
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Text paste */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-3">✏️ Pegar texto</h3>
          {!showTextInput ? (
            <button
              onClick={() => setShowTextInput(true)}
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition-colors"
            >
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-sm text-gray-600">
                Pegar contenido directamente
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Copia y pega texto de cualquier fuente
              </p>
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título del documento"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <textarea
                placeholder="Pega aquí el contenido del documento..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleTextSubmit}
                  className="flex-1 bg-violet-600 text-white text-sm font-medium py-2 rounded-md hover:bg-violet-700 transition-colors"
                >
                  Guardar texto
                </button>
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput("");
                    setTextTitle("");
                  }}
                  className="px-4 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supported formats info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-800 mb-2">
          Formatos soportados:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { ext: "PDF", icon: "📕" },
            { ext: "DOCX/DOC", icon: "📘" },
            { ext: "XLSX/XLS", icon: "📗" },
            { ext: "TXT", icon: "📄" },
            { ext: "MD", icon: "📝" },
            { ext: "Texto pegado", icon: "✏️" },
          ].map((f) => (
            <span
              key={f.ext}
              className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-700"
            >
              {f.icon} {f.ext}
            </span>
          ))}
        </div>
      </div>

      {/* Document list */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">
              Documentos cargados ({documents.length})
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {documents.map((doc, i) => (
              <li
                key={i}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {getFileIcon(doc.name)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.type} · {doc.format} · {doc.size}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {doc.status}
                </span>
                {doc.content && (
                  <button
                    onClick={() => handleAnalyze(doc.content, doc.name)}
                    disabled={analyzing}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    {analyzing ? "⏳" : "🔍"} Analizar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA: Go to construir after uploading */}
      {documents.length > 0 && !analysisResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              ✅ Documento cargado correctamente
            </p>
            <p className="text-xs text-green-700 mt-1">
              Ahora puedes analizar el documento para extraer objetivos y KPIs.
            </p>
          </div>
          <a
            href="/construir"
            className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex-shrink-0"
          >
            🏗️ Construir lineamientos →
          </a>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg">No hay documentos cargados aún.</p>
          <p className="text-sm mt-1">
            Sube al menos un PEI o FODA para usar "Construir Lineamientos".
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              📊 Análisis del Documento
            </h2>
            <span className={`text-xs px-2 py-1 rounded ${
              analysisResult.aiEnhanced
                ? "bg-violet-100 text-violet-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {analysisResult.aiEnhanced ? "Con IA" : "Sin IA (patrones)"}
            </span>
          </div>

          <p className="text-sm text-gray-600">{analysisResult.resumen}</p>

          {/* Detected Objectives */}
          {analysisResult.objetivos?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🎯 Objetivos Detectados ({analysisResult.objetivos.length})
              </h3>
              <div className="space-y-2">
                {analysisResult.objetivos.map((obj: any, i: number) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        obj.tipo === "estratégico" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      }`}>{obj.tipo}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        obj.confidence === "alta" ? "bg-green-100 text-green-700" :
                        obj.confidence === "media" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>Confianza: {obj.confidence}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">{obj.titulo}</p>
                    {obj.actividades?.length > 0 && (
                      <ul className="mt-2 space-y-1 pl-4">
                        {obj.actividades.map((act: string, j: number) => (
                          <li key={j} className="text-xs text-gray-600 list-disc">{act}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected KPIs */}
          {analysisResult.kpis?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                📈 KPIs Detectados ({analysisResult.kpis.length})
              </h3>
              <div className="space-y-2">
                {analysisResult.kpis.map((kpi: any, i: number) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">
                        {kpi.nomenclatura}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {kpi.perspectiva}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">{kpi.nombre}</p>
                    {kpi.objetivo && (
                      <p className="text-xs text-gray-600 mt-1">Objetivo: {kpi.objetivo}</p>
                    )}
                    {kpi.formula && (
                      <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                        {kpi.formula}
                      </p>
                    )}
                    {kpi.condiciones?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {kpi.condiciones.map((c: any, j: number) => (
                          <span key={j} className={`text-xs px-1.5 py-0.5 rounded ${
                            c.label === "Óptimo" ? "bg-green-50 text-green-600" :
                            c.label === "Aceptable" ? "bg-yellow-50 text-yellow-600" :
                            "bg-red-50 text-red-600"
                          }`}>{c.valor}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lineamientos */}
          {analysisResult.lineamientos?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                📜 Lineamientos ({analysisResult.lineamientos.length})
              </h3>
              <div className="space-y-2">
                {analysisResult.lineamientos.map((lin: any, i: number) => (
                  <div key={i} className="border rounded-md p-3">
                    <p className="text-sm font-medium text-gray-900">{lin.titulo}</p>
                    <p className="text-xs text-gray-500 mt-1">{lin.descripcion}</p>
                    {lin.objetivos_asociados?.length > 0 && (
                      <ul className="mt-2 space-y-1 pl-4">
                        {lin.objetivos_asociados.slice(0, 5).map((obj: string, j: number) => (
                          <li key={j} className="text-xs text-gray-600 list-disc">{obj}</li>
                        ))}
                        {lin.objetivos_asociados.length > 5 && (
                          <li className="text-xs text-gray-400">... y {lin.objetivos_asociados.length - 5} más</li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors">
            ✅ Guardar como mis lineamientos
          </button>
        </div>
      )}
    </div>
  );
}
