"use client";

import { useState } from "react";

interface Actividad {
  id: string;
  descripcion: string;
  plazoDias: string;
  prioridad: string;
  estado: string;
  completada: boolean;
  objetivo: {
    id: string;
    titulo: string;
    tipo: string;
    estado: string;
    gestion: string | null;
  };
}

interface Props {
  actividades: Actividad[];
}

const estadoColors: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  en_curso: "bg-blue-100 text-blue-800",
  terminado: "bg-green-100 text-green-800",
};

const prioridadColors: Record<string, string> = {
  alta: "bg-red-100 text-red-800",
  media: "bg-orange-100 text-orange-800",
  baja: "bg-gray-100 text-gray-700",
};

export function ActividadesClient({ actividades: initial }: Props) {
  const [actividades, setActividades] = useState<Actividad[]>(initial);
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("");
  const [filtroPlazo, setFiltroPlazo] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = actividades.filter((a) => {
    if (filtroEstado && a.estado !== filtroEstado) return false;
    if (filtroPrioridad && a.prioridad !== filtroPrioridad) return false;
    if (filtroPlazo && a.plazoDias !== filtroPlazo) return false;
    return true;
  });

  const plazos = [...new Set(actividades.map((a) => a.plazoDias))].sort();

  const stats = {
    total: actividades.length,
    pendientes: actividades.filter((a) => a.estado === "pendiente").length,
    enCurso: actividades.filter((a) => a.estado === "en_curso").length,
    terminadas: actividades.filter((a) => a.estado === "terminado").length,
  };

  async function handleChangeEstado(id: string, nuevoEstado: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/actividades/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setActividades((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, estado: nuevoEstado, completada: nuevoEstado === "terminado" }
              : a
          )
        );
      }
    } catch {
      // silent fail
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
          <p className="text-xs text-gray-500">Pendientes</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.enCurso}</p>
          <p className="text-xs text-gray-500">En Curso</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-2xl font-bold text-green-600">{stats.terminadas}</p>
          <p className="text-xs text-gray-500">Terminadas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En Curso</option>
            <option value="terminado">Terminado</option>
          </select>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700"
          >
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <select
            value={filtroPlazo}
            onChange={(e) => setFiltroPlazo(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700"
          >
            <option value="">Todos los plazos</option>
            {plazos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {(filtroEstado || filtroPrioridad || filtroPlazo) && (
            <button
              onClick={() => {
                setFiltroEstado("");
                setFiltroPrioridad("");
                setFiltroPlazo("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Activity list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <span className="text-4xl block mb-3">✅</span>
          <p className="text-gray-600">No hay actividades que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {act.descripcion}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Objetivo: {act.objetivo.titulo}
                    {act.objetivo.gestion && ` | Gestion ${act.objetivo.gestion}`}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        estadoColors[act.estado] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {act.estado.replace("_", " ")}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        prioridadColors[act.prioridad] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {act.prioridad}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {act.plazoDias}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <select
                    value={act.estado}
                    disabled={updating === act.id}
                    onChange={(e) => handleChangeEstado(act.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-700 disabled:opacity-50"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_curso">En Curso</option>
                    <option value="terminado">Terminado</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
