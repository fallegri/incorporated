"use client";

import { useState, useEffect } from "react";

export default function ConfiguracionPage() {
  const [provider, setProvider] = useState("none");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    // Load AI config
    fetch("/api/settings/ai")
      .then((r) => r.json())
      .then((data) => {
        setProvider(data.provider || "none");
        setHasApiKey(data.hasApiKey || false);
        setMaskedKey(data.maskedKey || null);
        setOllamaUrl(data.ollamaUrl || "");
      })
      .catch(() => {});

    // Load theme
    const saved = localStorage.getItem("incorporated_theme") || "default";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const handleSaveProvider = async () => {
    setSaving(true);
    setMessage("");
    try {
      const body: any = { provider };

      // Include API key if user entered one (for gemini/nvidia)
      if ((provider === "gemini" || provider === "nvidia") && apiKey) {
        body.apiKey = apiKey;
      }

      // Include Ollama URL if ollama is selected
      if (provider === "ollama" && ollamaUrl) {
        body.ollamaUrl = ollamaUrl;
      }

      const res = await fetch("/api/settings/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OK " + data.message);
        // If we saved an API key, update the masked display
        if (apiKey) {
          setHasApiKey(true);
          setMaskedKey("****" + apiKey.slice(-4));
          setApiKey(""); // Clear the input after saving
        }
      } else {
        setMessage("ERROR " + (data.error || "Error"));
      }
    } catch {
      setMessage("ERROR Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: "default", name: "Default (Azul)", bg: "bg-gray-50", primary: "#2563eb", sidebar: "#ffffff", text: "#111827" },
    { id: "dark", name: "Oscuro", bg: "bg-gray-900", primary: "#3b82f6", sidebar: "#1f2937", text: "#f9fafb" },
    { id: "warm", name: "Calido", bg: "bg-amber-50", primary: "#d97706", sidebar: "#fffbeb", text: "#292524" },
    { id: "green", name: "Verde Corporativo", bg: "bg-emerald-50", primary: "#059669", sidebar: "#f0fdf4", text: "#1f2937" },
    { id: "purple", name: "Violeta", bg: "bg-violet-50", primary: "#7c3aed", sidebar: "#f5f3ff", text: "#1f2937" },
    { id: "contrast", name: "Alto Contraste", bg: "bg-white", primary: "#000000", sidebar: "#f3f4f6", text: "#000000" },
  ];

  const applyTheme = (themeId: string) => {
    const t = themes.find((x) => x.id === themeId) || themes[0];
    document.documentElement.style.setProperty("--color-primary", t.primary);
    document.documentElement.style.setProperty("--color-text", t.text);
    document.documentElement.style.setProperty("--color-sidebar", t.sidebar);

    // Apply dark mode class
    if (themeId === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#111827";
      document.body.style.color = "#f9fafb";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    }
  };

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    localStorage.setItem("incorporated_theme", themeId);
    applyTheme(themeId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-gray-600 mt-1">Configura IA, apariencia y preferencias del sistema.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-md text-sm ${
          message.startsWith("OK") ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"
        }`}>{message}</div>
      )}

      {/* AI Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Proveedor de IA</h2>
        <p className="text-sm text-gray-600">
          Selecciona el proveedor de inteligencia artificial para el asistente y la generacion de lineamientos.
        </p>

        <div className="space-y-3">
          {/* Gemini */}
          <div className={`border-2 rounded-lg transition-colors ${
            provider === "gemini" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <label className="flex items-start gap-3 p-4 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="gemini"
                checked={provider === "gemini"}
                onChange={() => setProvider("gemini")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">Google Gemini (Cloud)</p>
                <p className="text-xs text-gray-600 mt-1">Usa la API de Google Gemini. Requiere API key.</p>
              </div>
            </label>
            {provider === "gemini" && (
              <div className="px-4 pb-4">
                <div className="p-3 bg-white border border-blue-200 rounded space-y-2">
                  {hasApiKey && (
                    <p className="text-xs text-green-700"><strong>Key guardada:</strong> {maskedKey}</p>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      {hasApiKey ? "Cambiar API Key:" : "API Key:"}
                    </p>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={hasApiKey ? "Dejar vacio para mantener actual" : "Pega tu API key de Gemini aqui"}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Obtener en <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* NVIDIA NIM */}
          <div className={`border-2 rounded-lg transition-colors ${
            provider === "nvidia" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <label className="flex items-start gap-3 p-4 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="nvidia"
                checked={provider === "nvidia"}
                onChange={() => setProvider("nvidia")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">NVIDIA NIM (Cloud, creditos gratis)</p>
                <p className="text-xs text-gray-600 mt-1">Modelos NVIDIA con creditos gratuitos. Compatible OpenAI API.</p>
              </div>
            </label>
            {provider === "nvidia" && (
              <div className="px-4 pb-4">
                <div className="p-3 bg-white border border-green-200 rounded space-y-2">
                  {hasApiKey && (
                    <p className="text-xs text-green-700"><strong>Key guardada:</strong> {maskedKey}</p>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      {hasApiKey ? "Cambiar API Key:" : "API Key:"}
                    </p>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={hasApiKey ? "Dejar vacio para mantener actual" : "Pega tu NVIDIA API key (nvapi-...) aqui"}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Obtener en <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">build.nvidia.com</a> → Buscar modelo → Get API Key
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ollama */}
          <div className={`border-2 rounded-lg transition-colors ${
            provider === "ollama" ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <label className="flex items-start gap-3 p-4 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="ollama"
                checked={provider === "ollama"}
                onChange={() => setProvider("ollama")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">Ollama (Local)</p>
                <p className="text-xs text-gray-600 mt-1">Modelos locales. Datos nunca salen de tu servidor.</p>
              </div>
            </label>
            {provider === "ollama" && (
              <div className="px-4 pb-4">
                <div className="p-3 bg-white border border-violet-200 rounded space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">URL del servidor Ollama:</p>
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="http://localhost:11434"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-gray-900"
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Instalar desde <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">ollama.ai</a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* None */}
          <div className={`border-2 rounded-lg transition-colors ${
            provider === "none" ? "border-gray-500 bg-gray-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <label className="flex items-start gap-3 p-4 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="none"
                checked={provider === "none"}
                onChange={() => setProvider("none")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">Sin IA</p>
                <p className="text-xs text-gray-600 mt-1">Solo analisis por patrones y gestion manual.</p>
              </div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSaveProvider}
          disabled={saving}
          className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando..." : "Guardar configuracion IA"}
        </button>
      </div>

      {/* Theme selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Tema Visual</h2>
        <p className="text-sm text-gray-600">Elige el esquema de colores del sistema.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                theme === t.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: t.primary }}></div>
                <span className="text-sm font-medium text-gray-900">{t.name}</span>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-3 rounded" style={{ backgroundColor: t.primary }}></div>
                <div className="w-8 h-3 rounded bg-gray-200"></div>
                <div className="w-8 h-3 rounded bg-gray-100"></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
