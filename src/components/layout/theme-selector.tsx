"use client";

import { useState, useEffect, useRef } from "react";

const themes = [
  { id: "default", name: "Default", color: "#2563eb" },
  { id: "dark", name: "Oscuro", color: "#1f2937" },
  { id: "warm", name: "Cálido", color: "#d97706" },
  { id: "green", name: "Verde", color: "#059669" },
  { id: "purple", name: "Violeta", color: "#7c3aed" },
  { id: "contrast", name: "Contraste", color: "#000000" },
];

export function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("default");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("incorporated_theme") || "default";
    setCurrent(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTheme = (themeId: string) => {
    const t = themes.find((x) => x.id === themeId) || themes[0];
    document.documentElement.style.setProperty("--color-primary", t.color);

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

  const selectTheme = (themeId: string) => {
    setCurrent(themeId);
    localStorage.setItem("incorporated_theme", themeId);
    applyTheme(themeId);
    setOpen(false);
  };

  const currentTheme = themes.find((t) => t.id === current) || themes[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        title="Cambiar tema"
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: currentTheme.color }}
        />
        <span className="text-xs text-gray-600 hidden md:inline">🎨</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-48">
          <p className="text-xs font-medium text-gray-500 mb-2">Tema visual</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTheme(t.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all ${
                  current === t.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                title={t.name}
              >
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-[10px] text-gray-600">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
