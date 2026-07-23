"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DocItem {
  id: string;
  name: string;
  type: string;
  format: string;
  status: string;
  hasContent: boolean;
  contentLength: number;
  createdAt: string;
}

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [docType, setDocType] = useState("OTRO");
  const [message, setMessage] = useState("");

  // Load documents from DB on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/docs");
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
      }
    } catch {} finally {
      setLoadingDocs(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !textTitle.trim()) {
      alert("Ingresa un título y el contenido del texto.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: textTitle.trim(),
          type: docType,
          content: textInput.trim(),
          format: "TEXT",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Documento guardado correctamente");
        setTextInput("");
        setTextTitle("");
        setShowTextInput(false);
        setDocType("OTRO");
        fetchDocuments(); // Refresh list
      } else {
        alert(data.error || "Error al guardar");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">📄 Documentos</h1>
        <p className="text-gray-600 mt-1">
          Carga documentos organizacionales para analizar y extraer lineamientos.
        </p>
      </div>

      {/* Success message */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-green-800">{message}</p>
          <Link
            href="/construir"
            className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex-shrink-0"
          >
            🏗️ Construir lineamientos →
          </Link>
        </div>
      )}

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

      {/* Paste text */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-3">✏️ Cargar documento</h3>

        {!showTextInput ? (
          <button
            onClick={() => setShowTextInput(true)}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <span className="text-3xl block mb-2">📋</span>
            <p className="text-sm text-gray-600">
              Click para pegar contenido de tu documento
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Copia y pega texto de PDF, Word, o cualquier fuente
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título del documento (ej: PEI 2024-2028)"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Pega aquí el contenido completo del documento..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {textInput.length > 0 ? `${(textInput.length / 1024).toFixed(1)} KB` : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput("");
                    setTextTitle("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTextSubmit}
                  disabled={saving || !textInput.trim() || !textTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Guardando..." : "💾 Guardar documento"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document list from DB */}
      {loadingDocs && (
        <div className="text-center py-6 text-gray-400">Cargando documentos...</div>
      )}

      {!loadingDocs && documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Documentos guardados ({documents.length})
            </h2>
            <Link
              href="/construir"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              🏗️ Ir a construir →
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
                      {doc.type} · {(doc.contentLength / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  ✅ Guardado
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loadingDocs && documents.length === 0 && !message && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg">No hay documentos cargados aún.</p>
          <p className="text-sm mt-1">
            Carga al menos un PEI o FODA para construir tus lineamientos.
          </p>
        </div>
      )}
    </div>
  );
}
