"use client";

import { useState } from "react";

interface TimelineEvent {
  id: string;
  date: string;
  daysFromStart: number;
  plazo: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

interface TimelineData {
  startDate: string;
  cargo: string;
  cargoDescription: string | null;
  totalEvents: number;
  events: TimelineEvent[];
}

interface TimelineClientProps {
  data: TimelineData | null;
}

const plazoColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "30": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", dot: "bg-blue-500" },
  "60": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
  "90": { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", dot: "bg-red-500" },
  "trimestral": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", dot: "bg-purple-500" },
  "semestral": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
  "anual": { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", dot: "bg-indigo-500" },
};

const typeIcons: Record<string, string> = {
  activity: "📋",
  milestone: "🏁",
  kpi_review: "📊",
};

const statusBadge: Record<string, { bg: string; text: string }> = {
  pendiente: { bg: "bg-yellow-100", text: "text-yellow-800" },
  en_curso: { bg: "bg-blue-100", text: "text-blue-800" },
  terminado: { bg: "bg-green-100", text: "text-green-800" },
  pasado: { bg: "bg-gray-100", text: "text-gray-600" },
};

export function TimelineClient({ data }: TimelineClientProps) {
  const [filter, setFilter] = useState<string>("all");

  if (!data || data.events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900">
          Sin eventos en la linea de tiempo
        </h3>
        <p className="text-gray-500 mt-2">
          Cuando tengas objetivos y actividades asignados, aqui veras una linea
          de tiempo visual con tus hitos y plazos.
        </p>
      </div>
    );
  }

  const filteredEvents =
    filter === "all"
      ? data.events
      : data.events.filter((e) => e.plazo === filter || e.type === filter);

  // Group events by plazo section
  const sections = [
    { key: "30", label: "Primeros 30 dias", events: data.events.filter(e => e.daysFromStart <= 30) },
    { key: "60", label: "31 a 60 dias", events: data.events.filter(e => e.daysFromStart > 30 && e.daysFromStart <= 60) },
    { key: "90", label: "61 a 90 dias", events: data.events.filter(e => e.daysFromStart > 60 && e.daysFromStart <= 90) },
    { key: "beyond", label: "Mas de 90 dias (ritmos de gestion)", events: data.events.filter(e => e.daysFromStart > 90) },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("activity")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "activity"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📋 Actividades
          </button>
          <button
            onClick={() => setFilter("milestone")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "milestone"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🏁 Hitos
          </button>
          <button
            onClick={() => setFilter("kpi_review")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "kpi_review"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📊 Revisiones KPI
          </button>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {sections.map((section) => {
          const sectionEvents = filter === "all"
            ? section.events
            : section.events.filter(e => e.plazo === filter || e.type === filter);

          if (sectionEvents.length === 0) return null;

          const colors = plazoColors[section.key] || plazoColors["90"];

          return (
            <div key={section.key} className="mb-8 last:mb-0">
              {/* Section header */}
              <div className={`${colors.bg} ${colors.border} border rounded-lg px-4 py-2 mb-4`}>
                <h3 className={`text-sm font-bold ${colors.text}`}>
                  {section.label}
                </h3>
              </div>

              {/* Events in this section */}
              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

                {sectionEvents.map((event, idx) => {
                  const eventColors = plazoColors[event.plazo] || plazoColors["90"];
                  const sBadge = statusBadge[event.status] || statusBadge["pendiente"];

                  return (
                    <div key={event.id} className="relative mb-4 last:mb-0">
                      {/* Dot on the timeline */}
                      <div
                        className={`absolute -left-5 top-2 w-3 h-3 rounded-full ${eventColors.dot} ring-2 ring-white`}
                      />

                      {/* Event card */}
                      <div className={`${eventColors.bg} ${eventColors.border} border rounded-lg p-3 ml-2`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-base">
                                {typeIcons[event.type] || "📌"}
                              </span>
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {event.title}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 ml-7">
                              {event.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sBadge.bg} ${sBadge.text}`}
                            >
                              {event.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              Dia {event.daysFromStart}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 ml-7">
                          <span className="text-xs text-gray-400">
                            {new Date(event.date).toLocaleDateString("es", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {event.priority === "alta" && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                              Prioridad alta
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
