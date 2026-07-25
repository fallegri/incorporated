"use client";

import { useState, useEffect } from "react";

export default function ConfiguracionPage() {
  const [provider, setProvider] = useState("none");
  const [hasApiKey, setHasApiKey] = useState(false);
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
      const res = await fetch("/api/settings/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
      } else {
        setMessage("❌ " + (data.error || "Error"));
      }
    } catch {
      setMessage("❌ Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: "default", name: "Default (Azul)", bg: "bg-gray-50", primary: "#2563eb", sidebar: "#ffffff", text: "#111827" },
    { id: "dark", name: "Oscuro", bg: "bg-gray-900", primary: "#3b82f6", sidebar: "#1f2937", text: "#f9fafb" },
    { id: "warm", name: "Cálido", bg: "bg-amber-50", primary: "#d97706", sidebar: "#fffbeb", text: "#292524" },
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
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Configuración</h1>
        <p className="text-gray-600 mt-1">Configura IA, apariencia y preferencias del sistema.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-md text-sm ${
          message.startsWith("✅") ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"
        }`}>{message}</div>
      )}

      {/* AI Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">🤖 Proveedor de IA</h2>
        <p className="text-sm text-gray-600">
          Selecciona el proveedor de inteligencia artificial para el asistente y la generación de lineamientos.
        </p>

        <div className="space-y-3">
          {/* Gemini */}
          <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            provider === "gemini" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input
              type="radio"
              name="provider"
              value="gemini"
              checked={provider === "gemini"}
              onChange={() => setProvider("gemini")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">🌐 Google Gemini (Cloud)</p>
              <p className="text-xs text-gray-600 mt-1">
                Usa la API de Google Gemini. Requiere API key configurada en las variables de entorno del servidor.
              </p>
              {provider === "gemini" && (
                <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
                  <p className="text-xs text-gray-700">
                    <strong>Estado:</strong> {hasApiKey ? "✅ API Key detectada" : "⚠️ API Key no configurada"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    La API key se configura en Vercel → Settings → Environment Variables → 
                    <code className="bg-gray-100 px-1">GOOGLE_GENERATIVE_AI_API_KEY</code>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tu key de Gemini Pro funciona aquí. Soporta gemini-1.5-flash y gemini-1.5-pro.
                  </p>
                </div>
              )}
            </div>
          </label>

          {/* NVIDIA NIM */}
          <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            provider === "nvidia" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input
              type="radio"
              name="provider"
              value="nvidia"
              checked={provider === "nvidia"}
              onChange={() => setProvider("nvidia")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">🟢 NVIDIA NIM (Cloud, créditos gratis)</p>
              <p className="text-xs text-gray-600 mt-1">
                Usa modelos NVIDIA NIM con créditos gratuitos. Compatible con API OpenAI.
              </p>
              {provider === "nvidia" && (
                <div className="mt-3 p-3 bg-white border border-green-200 rounded">
                  <p className="text-xs text-gray-500">
                    Configura en variables de entorno:<br/>
                    <code className="bg-gray-100 px-1">NVIDIA_API_KEY</code> = tu API key de{" "}
                    <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">build.nvidia.com</a>
                  </p>
                </div>
              )}
            </div>
          </label>

          {/* Ollama */}
          <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            provider === "ollama" ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input
              type="radio"
              name="provider"
              value="ollama"
              checked={provider === "ollama"}
              onChange={() => setProvider("ollama")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">🏠 Ollama (Local)</p>
              <p className="text-xs text-gray-600 mt-1">
                Ejecuta modelos de IA localmente. Los datos nunca salen de tu servidor.
              </p>
              {provider === "ollama" && (
                <div className="mt-3 p-3 bg-white border border-violet-200 rounded">
                  <p className="text-xs text-gray-500">
                    Configura en variables de entorno:<br/>
                    <code className="bg-gray-100 px-1">OLLAMA_BASE_URL</code> = http://tu-servidor:11434<br/>
                    <code className="bg-gray-100 px-1">OLLAMA_MODEL</code> = llama3.1
                  </p>
                </div>
              )}
            </div>
          </label>

          {/* None */}
          <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            provider === "none" ? "border-gray-500 bg-gray-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input
              type="radio"
              name="provider"
              value="none"
              checked={provider === "none"}
              onChange={() => setProvider("none")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">❌ Sin IA</p>
              <p className="text-xs text-gray-600 mt-1">
                El sistema funciona sin inteligencia artificial. Solo análisis por patrones y gestión manual.
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSaveProvider}
          disabled={saving}
          className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando..." : "💾 Guardar configuración IA"}
        </button>
      </div>

      {/* Theme selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">🎨 Tema Visual</h2>
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
