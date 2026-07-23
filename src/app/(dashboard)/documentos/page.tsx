"use client";

import { useState } from "react";

export default function DocumentosPage() {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF");
      return;
    }
    setUploading(true);
    // TODO: Implement actual upload to Vercel Blob
    setTimeout(() => {
      setDocuments((prev) => [
        ...prev,
        { name: file.name, type: "OTRO", status: "UPLOADED", createdAt: new Date() },
      ]);
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">📄 Documentos</h1>
        <p className="text-gray-600 mt-1">
          Sube documentos organizacionales (PEI, FODA, MOF, POI) para que el
          asistente IA los analice.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="text-center">
            <span className="text-4xl block mb-2">{uploading ? "⏳" : "📎"}</span>
            <p className="text-sm text-gray-600">
              {uploading
                ? "Subiendo documento..."
                : "Click para seleccionar PDF o arrastra aquí"}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, máximo 20MB</p>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Document list */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Documentos cargados</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {documents.map((doc, i) => (
              <li key={i} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">Tipo: {doc.type}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  {doc.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No hay documentos cargados aún.</p>
          <p className="text-sm mt-1">
            Sube al menos un PEI o FODA para usar la función "Construir Lineamientos".
          </p>
        </div>
      )}
    </div>
  );
}
