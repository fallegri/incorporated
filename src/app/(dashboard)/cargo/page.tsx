import { auth } from "@/lib/auth";

export default async function CargoPage() {
  const session = await auth();
  const user = session?.user as any;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">👤 Mi Cargo</h1>
        <p className="text-gray-600 mt-1">
          Información sobre tu posición, competencias y ubicación en la organización.
        </p>
      </div>

      {/* Cargo info card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Información del Cargo
          </h2>
          <a
            href="/admin"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Editar →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Cargo</p>
            <p className="text-sm text-gray-900 mt-1">Sin asignar</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Área</p>
            <p className="text-sm text-gray-900 mt-1">Sin asignar</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Reporta a</p>
            <p className="text-sm text-gray-900 mt-1">—</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Rol en el sistema</p>
            <p className="text-sm text-gray-900 mt-1 capitalize">
              {user?.role?.toLowerCase().replace("_", " ") || "—"}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-xs font-medium text-gray-500 uppercase">Descripción del cargo</p>
          <p className="text-sm text-gray-600 mt-1 italic">
            No hay descripción definida. Ve a Administración para configurar tu cargo.
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-xs font-medium text-gray-500 uppercase">Competencias requeridas</p>
          <p className="text-sm text-gray-600 mt-1 italic">
            No hay competencias definidas aún.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Define tu cargo en la sección de Administración,
          luego sube documentos (PEI, FODA) y usa "Construir Lineamientos" para
          que la IA genere objetivos personalizados.
        </p>
      </div>
    </div>
  );
}
