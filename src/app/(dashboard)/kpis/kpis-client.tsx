"use client";

import { useState } from "react";

interface KPI {
  id: string;
  nombre: string;
  metrica: string;
  meta: string;
  valorActual: string | null;
  frecuencia: string;
  objetivo: {
    id: string;
    titulo: string;
    gestion: string | null;
  };
}

interface Props {
  kpis: KPI[];
}

function getSemaforo(kpi: KPI): { color: string; label: string; bg: string; ring: string } {
  const meta = parseFloat(kpi.meta);
  const actual = parseFloat(kpi.valorActual || "0");

  if (isNaN(meta) || meta === 0) {
    return { color: "text-gray-500", label: "Sin datos", bg: "bg-gray-100", ring: "ring-gray-300" };
  }

  const porcentaje = (actual / meta) * 100;

  if (porcentaje >= 75) {
    return { color: "text-green-700", label: "En meta", bg: "bg-green-50", ring: "ring-green-400" };
  } else if (porcentaje >= 50) {
    return { color: "text-yellow-700", label: "En riesgo", bg: "bg-yellow-50", ring: "ring-yellow-400" };
  } else {
    return { color: "text-red-700", label: "Critico", bg: "bg-red-50", ring: "ring-red-400" };
  }
}

function getProgressPercent(kpi: KPI): number {
  const meta = parseFloat(kpi.meta);
  const actual = parseFloat(kpi.valorActual || "0");
  if (isNaN(meta) || meta === 0) return 0;
  return Math.min(Math.round((actual / meta) * 100), 100);
}

export function KpisClient({ kpis: initial }: Props) {
  const [kpis, setKpis] = useState<KPI[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const stats = {
    total: kpis.length,
    verde: kpis.filter((k) => getSemaforo(k).label === "En meta").length,
    amarillo: kpis.filter((k) => getSemaforo(k).label === "En riesgo").length,
    rojo: kpis.filter((k) => getSemaforo(k).label === "Critico").length,
  };

  async function handleSave(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/kpis/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorActual: editValue }),
      });
      if (res.ok) {
        setKpis((prev) =>
          prev.map((k) => (k.id === id ? { ...k, valorActual: editValue } : k))
        );
        setEditingId(null);
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Semaforo Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total KPIs</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-700">{stats.verde}</p>
          <p className="text-xs text-green-600">En meta (verde)</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <p className="text-2xl font-bold text-yellow-700">{stats.amarillo}</p>
          <p className="text-xs text-yellow-600">En riesgo (amarillo)</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-2xl font-bold text-red-700">{stats.rojo}</p>
          <p className="text-xs text-red-600">Critico (rojo)</p>
        </div>
      </div>

      {/* KPIs List */}
      {kpis.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <span className="text-4xl block mb-3">📈</span>
          <p className="text-gray-600">
            No tienes KPIs definidos. Construye lineamientos para generar KPIs automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi) => {
            const semaforo = getSemaforo(kpi);
            const progress = getProgressPercent(kpi);
            const isEditing = editingId === kpi.id;

            return (
              <div
                key={kpi.id}
                className={`rounded-lg border p-5 ${semaforo.bg} ring-1 ${semaforo.ring}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {kpi.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {kpi.objetivo.titulo}
                      {kpi.objetivo.gestion && ` | Gestion ${kpi.objetivo.gestion}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${semaforo.color} ${semaforo.bg}`}
                  >
                    {semaforo.label}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-gray-500">Metrica:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {kpi.metrica}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs text-gray-500">Meta:</span>
                    <span className="text-xs font-medium text-gray-700">{kpi.meta}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs text-gray-500">Actual:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 text-xs border border-gray-300 rounded px-2 py-0.5"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(kpi.id)}
                          disabled={saving}
                          className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded disabled:opacity-50"
                        >
                          {saving ? "..." : "OK"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-500 px-1"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-700">
                        {kpi.valorActual || "Sin registrar"}
                        <button
                          onClick={() => {
                            setEditingId(kpi.id);
                            setEditValue(kpi.valorActual || "");
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </button>
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs text-gray-500">Frecuencia:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {kpi.frecuencia}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        progress >= 75
                          ? "bg-green-500"
                          : progress >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
