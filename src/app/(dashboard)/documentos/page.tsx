"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DocItem {
  id: string;
  name: string;
  type: string;
  format: string;
  hasContent: boolean;
  contentLength: number;
  createdAt: string;
}

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("OTRO");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // For paste text fallback
  const [showPaste, setShowPaste] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/docs");
      const data = await res.json();
      if (res.ok) setDocuments(data.documents || []);
    } catch {} finally {
      setLoadingDocs(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", docType);

    try {
      const res = await fetch("/api/docs/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ "${file.name}" procesado — ${data.message}`);
        fetchDocuments();
      } else {
        setErrorMsg(data.error || "Error al procesar archivo");
      }
    } catch {
      setErrorMsg("Error de conexión al subir archivo");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim() || !pasteTitle.trim()) return;
    setSaving(true);
    setMessage("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pasteTitle.trim(),
          type: docType,
          content: pasteText.trim(),
          format: "TEXT",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ "${pasteTitle}" guardado correctamente`);
        setPasteTitle("");
        setPasteText("");
        setShowPaste(false);
        fetchDocuments();
      } else {
        setErrorMsg(data.error || "Error al guardar");
      }
    } catch {
      setErrorMsg("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">📄 Documentos</h1>
        <p className="text-gray-600 mt-1">
          Sube tus documentos organizacionales. El sistema los convierte
          automáticamente a texto para su análisis.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-green-800">{message}</p>
          <Link
            href="/construir"
            className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex-shrink-0 ml-4"
          >
            🏗️ Construir lineamientos →
          </Link>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {errorMsg}
        </div>
      )}

      {/* Type selector */}
      <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Tipo:</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="PEI">PEI — Plan Estratégico</option>
          <option value="FODA">FODA</option>
          <option value="MOF">MOF — Manual de Funciones</option>
          <option value="POI">POI — Plan Operativo</option>
          <option value="OTRO">Otro</option>
        </select>
        <span className="text-xs text-gray-400">
          Selecciona el tipo antes de subir
        </span>
      </div>

      {/* File upload — PRIMARY ACTION */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading
              ? "border-blue-300 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <div className="text-center">
            <span className="text-4xl block mb-2">
              {uploading ? "⏳" : "📁"}
            </span>
            <p className="text-sm font-medium text-gray-700">
              {uploading ? "Procesando archivo..." : "Click para seleccionar archivo"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, Word (.docx), TXT, Markdown — máx. 20MB
            </p>
            <p className="text-xs text-gray-400">
              El sistema extrae el texto automáticamente
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

        {/* Paste text as secondary option */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {!showPaste ? (
            <button
              onClick={() => setShowPaste(true)}
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              ¿No tienes archivo? <span className="underline">Pegar texto directamente</span>
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título del documento"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Pega el contenido aquí..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowPaste(false); setPasteTitle(""); setPasteText(""); }}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePasteSubmit}
                  disabled={saving || !pasteText.trim() || !pasteTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Guardando..." : "💾 Guardar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document list */}
      {loadingDocs && (
        <div className="text-center py-6 text-gray-400">Cargando...</div>
      )}

      {!loadingDocs && documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Documentos ({documents.length})
            </h2>
            <Link
              href="/construir"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              🏗️ Construir lineamientos →
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {doc.type === "PEI" ? "📕" : doc.type === "FODA" ? "📊" :
                     doc.type === "MOF" ? "📘" : doc.type === "POI" ? "📗" : "📄"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.type} · {doc.format} · {(doc.contentLength / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  ✅ Listo
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loadingDocs && documents.length === 0 && !message && (
        <div className="text-center py-8 text-gray-400">
          <p>No hay documentos cargados aún.</p>
        </div>
      )}
    </div>
  );
}
