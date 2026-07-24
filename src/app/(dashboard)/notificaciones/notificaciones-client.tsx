"use client";

interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  detalle: string;
  prioridad: string;
  fecha: string;
}

interface Props {
  alertas: Alerta[];
}

const prioridadStyles: Record<string, { bg: string; icon: string; border: string }> = {
  alta: { bg: "bg-red-50", icon: "🔴", border: "border-red-200" },
  media: { bg: "bg-yellow-50", icon: "🟡", border: "border-yellow-200" },
  baja: { bg: "bg-blue-50", icon: "🔵", border: "border-blue-200" },
};

const tipoIcons: Record<string, string> = {
  actividad_vencimiento: "⏰",
  kpi_critico: "📉",
};

export function NotificacionesClient({ alertas }: Props) {
  if (alertas.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <span className="text-4xl block mb-3">🎉</span>
        <h2 className="text-lg font-semibold text-gray-900">Sin alertas</h2>
        <p className="text-gray-600 mt-1">
          No tienes notificaciones pendientes. Tus actividades y KPIs estan al dia.
        </p>
      </div>
    );
  }

  const alertasAltas = alertas.filter((a) => a.prioridad === "alta");
  const alertasMedias = alertas.filter((a) => a.prioridad === "media");
  const alertasBajas = alertas.filter((a) => a.prioridad === "baja");

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-red-700">{alertasAltas.length}</p>
          <p className="text-xs text-red-600">Criticas</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-yellow-700">{alertasMedias.length}</p>
          <p className="text-xs text-yellow-600">Medias</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-700">{alertasBajas.length}</p>
          <p className="text-xs text-blue-600">Informativas</p>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {alertas.map((alerta) => {
          const style = prioridadStyles[alerta.prioridad] || prioridadStyles.baja;
          const icon = tipoIcons[alerta.tipo] || "🔔";

          return (
            <div
              key={alerta.id}
              className={`rounded-lg border p-4 ${style.bg} ${style.border}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alerta.titulo}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{alerta.detalle}</p>
                </div>
                <span className="text-lg flex-shrink-0">{style.icon}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
