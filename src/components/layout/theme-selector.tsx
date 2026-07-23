"use client";

import { useState, useEffect, useRef } from "react";

const themes = [
  { id: "default", name: "Default", color: "#2563eb", bg: "bg-gray-50", cardBg: "bg-white", text: "text-gray-900", border: "border-gray-200" },
  { id: "dark", name: "Oscuro", color: "#3b82f6", bg: "bg-gray-900", cardBg: "bg-gray-800", text: "text-gray-100", border: "border-gray-700" },
  { id: "warm", name: "Cálido", color: "#d97706", bg: "bg-orange-50", cardBg: "bg-white", text: "text-gray-900", border: "border-orange-200" },
  { id: "green", name: "Verde", color: "#059669", bg: "bg-emerald-50", cardBg: "bg-white", text: "text-gray-900", border: "border-emerald-200" },
  { id: "purple", name: "Violeta", color: "#7c3aed", bg: "bg-violet-50", cardBg: "bg-white", text: "text-gray-900", border: "border-violet-200" },
  { id: "contrast", name: "Contraste", color: "#000000", bg: "bg-yellow-50", cardBg: "bg-white", text: "text-black", border: "border-black" },
];

function applyTheme(themeId: string) {
  const t = themes.find((x) => x.id === themeId) || themes[0];
  const root = document.documentElement;
  const body = document.body;
  const main = document.querySelector("main");

  // Reset
  body.className = "";
  
  // Apply background to body and main
  if (themeId === "dark") {
    body.style.backgroundColor = "#111827";
    body.style.color = "#f3f4f6";
    if (main) main.style.backgroundColor = "#111827";
    // Make cards dark
    document.querySelectorAll(".bg-white").forEach((el) => {
      (el as HTMLElement).style.backgroundColor = "#1f2937";
      (el as HTMLElement).style.borderColor = "#374151";
      (el as HTMLElement).style.color = "#f3f4f6";
    });
  } else {
    const bgColors: Record<string, string> = {
      default: "#f9fafb",
      warm: "#fff7ed",
      green: "#ecfdf5",
      purple: "#f5f3ff",
      contrast: "#fefce8",
    };
    body.style.backgroundColor = bgColors[themeId] || "#f9fafb";
    body.style.color = themeId === "contrast" ? "#000000" : "#111827";
    if (main) main.style.backgroundColor = bgColors[themeId] || "#f9fafb";
    // Reset cards
    document.querySelectorAll(".bg-white").forEach((el) => {
      (el as HTMLElement).style.backgroundColor = "";
      (el as HTMLElement).style.borderColor = "";
      (el as HTMLElement).style.color = "";
    });
  }

  // Apply accent color via CSS variable
  root.style.setProperty("--color-accent", t.color);
}

export function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("default");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("incorporated_theme") || "default";
    setCurrent(saved);
    applyTheme(saved);
  }, []);

  // Re-apply on navigation (Next.js client transitions)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const saved = localStorage.getItem("incorporated_theme") || "default";
      if (saved !== "default") {
        setTimeout(() => applyTheme(saved), 100);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
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
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
        title="Cambiar tema"
      >
        <div
          className="w-4 h-4 rounded-full border border-white shadow-sm"
          style={{ backgroundColor: currentTheme.color }}
        />
        <span className="text-xs text-gray-600">🎨</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 w-52">
          <p className="text-xs font-semibold text-gray-700 mb-2">Tema visual</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTheme(t.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  current === t.id
                    ? "ring-2 ring-offset-1 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-100"
                }`}
                title={t.name}
              >
                <div
                  className="w-7 h-7 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-[10px] text-gray-700 font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
