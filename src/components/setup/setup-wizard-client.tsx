"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SetupWizardProps {
  org: {
    id: string;
    name: string;
    sector: string;
    mision: string;
    vision: string;
    aiProvider: string;
  };
  documents: { id: string; name: string; type: string; status: string }[];
  areas: { id: string; name: string }[];
  cargos: { id: string; name: string }[];
  users: { id: string; name: string | null; email: string; role: string }[];
}

const STEPS = [
  { id: 1, title: "Datos de la Empresa", icon: "🏢" },
  { id: 2, title: "Documentos Estrategicos", icon: "📄" },
  { id: 3, title: "Desarrollo Humano", icon: "👥" },
  { id: 4, title: "Configurar IA", icon: "🤖" },
  { id: 5, title: "Revisar y Publicar", icon: "🚀" },
];

export function SetupWizardClient({
  org,
  documents,
  areas,
  cargos,
  users,
}: SetupWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state for step 1
  const [name, setName] = useState(org.name);
  const [sector, setSector] = useState(org.sector);
  const [mision, setMision] = useState(org.mision);
  const [vision, setVision] = useState(org.vision);

  const handleSaveCompanyInfo = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/org/setup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sector, mision, vision }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar");
      } else {
        setSuccess("Datos guardados correctamente");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch("/api/org/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al publicar");
        setPublishing(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Error de conexion");
      setPublishing(false);
    }
  };

  const goNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Computed values for review
  const strategicDocs = documents.filter(
    (d) => d.type === "PEI" || d.type === "POI" || d.type === "FODA"
  );
  const dhDocs = documents.filter(
    (d) => d.type === "MOF" || d.type === "OTRO"
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Configurar Empresa
        </h1>
        <p className="text-gray-600 mt-1">
          Completa los pasos para activar tu organizacion en Incorporated
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center text-center transition-colors ${
                  currentStep === step.id
                    ? "text-blue-700"
                    : currentStep > step.id
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 border-2 transition-colors ${
                    currentStep === step.id
                      ? "border-blue-600 bg-blue-50"
                      : currentStep > step.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.icon}
                </div>
                <span className="text-xs font-medium hidden sm:block">
                  {step.title}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Step 1: Company Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Informacion de la Empresa
            </h2>
            <p className="text-sm text-gray-600">
              Ingresa los datos basicos de tu organizacion
            </p>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre de tu empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar sector...</option>
                  <option value="educacion">Educacion</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="salud">Salud</option>
                  <option value="finanzas">Finanzas</option>
                  <option value="gobierno">Gobierno</option>
                  <option value="industria">Industria</option>
                  <option value="comercio">Comercio</option>
                  <option value="servicios">Servicios</option>
                  <option value="ong">ONG / Sin fines de lucro</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mision
                </label>
                <textarea
                  value={mision}
                  onChange={(e) => setMision(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mision de la organizacion..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vision
                </label>
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Vision de la organizacion..."
                />
              </div>
            </div>

            <button
              onClick={handleSaveCompanyInfo}
              disabled={saving}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar Datos"}
            </button>
          </div>
        )}

        {/* Step 2: Strategic Documents */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Documentos Estrategicos
            </h2>
            <p className="text-sm text-gray-600">
              Sube los documentos estrategicos de tu organizacion: PEI, POA, FODA
            </p>

            <div className="grid gap-3">
              <DocStatus
                label="PEI (Plan Estrategico Institucional)"
                type="PEI"
                documents={documents}
              />
              <DocStatus
                label="POA (Plan Operativo Anual)"
                type="POI"
                documents={documents}
              />
              <DocStatus
                label="FODA (Fortalezas, Oportunidades, Debilidades, Amenazas)"
                type="FODA"
                documents={documents}
              />
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Puedes subir estos documentos desde la
                seccion{" "}
                <a
                  href="/documentos"
                  className="underline font-medium"
                >
                  Biblioteca de Documentos
                </a>
                . Formatos aceptados: PDF, DOCX, TXT, MD.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: DH Documents */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Desarrollo Humano
            </h2>
            <p className="text-sm text-gray-600">
              Documentos de estructura organizacional y personal
            </p>

            <div className="grid gap-3">
              <DocStatus
                label="MOF (Manual de Organizacion y Funciones)"
                type="MOF"
                documents={documents}
              />
              <DocStatus
                label="Organigrama"
                type="OTRO"
                documents={documents}
                matchName="organigrama"
              />
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Estructura Actual
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {areas.length}
                  </p>
                  <p className="text-xs text-gray-600">Areas</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {cargos.length}
                  </p>
                  <p className="text-xs text-gray-600">Cargos</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {users.length}
                  </p>
                  <p className="text-xs text-gray-600">Usuarios</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Puedes gestionar areas y cargos desde{" "}
                <a
                  href="/admin/configuracion"
                  className="underline font-medium"
                >
                  Estructura Organizacional
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* Step 4: AI Configuration */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Configurar Inteligencia Artificial
            </h2>
            <p className="text-sm text-gray-600">
              Opcional: Configura un proveedor de IA para generar lineamientos y
              analisis automaticos.
            </p>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-medium text-gray-900">
                    Proveedor actual:{" "}
                    <span className="text-blue-700 capitalize">
                      {org.aiProvider === "none"
                        ? "Ninguno"
                        : org.aiProvider}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {org.aiProvider === "none"
                      ? "No se ha configurado un proveedor de IA"
                      : "IA configurada y lista para usar"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Puedes configurar el proveedor de IA desde{" "}
                <a
                  href="/admin/configuracion"
                  className="underline font-medium"
                >
                  Configuracion del Sistema
                </a>
                . Proveedores disponibles: Gemini, NVIDIA, Ollama.
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Este paso es opcional. Puedes configurar la IA despues de publicar
              tu empresa.
            </p>
          </div>
        )}

        {/* Step 5: Review and Publish */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Revisar y Publicar
            </h2>
            <p className="text-sm text-gray-600">
              Revisa la configuracion de tu empresa antes de publicarla.
            </p>

            <div className="grid gap-4">
              {/* Company info summary */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">
                  Datos de la Empresa
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Nombre:</span>{" "}
                    <span className="font-medium">{name || "Sin definir"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sector:</span>{" "}
                    <span className="font-medium capitalize">
                      {sector || "Sin definir"}
                    </span>
                  </div>
                </div>
                {mision && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="text-gray-500">Mision:</span> {mision}
                  </p>
                )}
                {vision && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="text-gray-500">Vision:</span> {vision}
                  </p>
                )}
              </div>

              {/* Documents summary */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Documentos</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Estrategicos:</span>{" "}
                    <span className="font-medium">
                      {strategicDocs.length} documento(s)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">DH:</span>{" "}
                    <span className="font-medium">
                      {dhDocs.length} documento(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Structure summary */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Estructura</h3>
                <div className="grid grid-cols-3 gap-2 text-sm text-center">
                  <div>
                    <span className="font-bold text-lg text-gray-900">
                      {areas.length}
                    </span>
                    <p className="text-gray-500">Areas</p>
                  </div>
                  <div>
                    <span className="font-bold text-lg text-gray-900">
                      {cargos.length}
                    </span>
                    <p className="text-gray-500">Cargos</p>
                  </div>
                  <div>
                    <span className="font-bold text-lg text-gray-900">
                      {users.length}
                    </span>
                    <p className="text-gray-500">Usuarios</p>
                  </div>
                </div>
              </div>

              {/* AI status */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-1">
                  Inteligencia Artificial
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {org.aiProvider === "none"
                    ? "No configurada (opcional)"
                    : `Proveedor: ${org.aiProvider}`}
                </p>
              </div>
            </div>

            {/* Publish button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-lg"
              >
                {publishing ? "Publicando..." : "🚀 Publicar Empresa"}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Al publicar, tu empresa quedara activa y todos los usuarios
                podran acceder al sistema completo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        {currentStep < 5 && (
          <button
            onClick={goNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}

function DocStatus({
  label,
  type,
  documents,
  matchName,
}: {
  label: string;
  type: string;
  documents: { id: string; name: string; type: string; status: string }[];
  matchName?: string;
}) {
  const found = documents.filter((d) => {
    if (matchName) {
      return d.name.toLowerCase().includes(matchName.toLowerCase());
    }
    return d.type === type;
  });

  const hasDoc = found.length > 0;

  return (
    <div
      className={`p-3 rounded-lg border flex items-center gap-3 ${
        hasDoc
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <span className="text-xl">{hasDoc ? "✅" : "⚠️"}</span>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            hasDoc ? "text-green-800" : "text-yellow-800"
          }`}
        >
          {label}
        </p>
        {hasDoc ? (
          <p className="text-xs text-green-600">
            {found.map((d) => d.name).join(", ")}
          </p>
        ) : (
          <p className="text-xs text-yellow-600">No subido aun</p>
        )}
      </div>
    </div>
  );
}
