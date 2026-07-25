import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();
  const user = session?.user as any;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Administración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona la estructura organizacional, cargos y usuarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Áreas */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏢</span>
            <h3 className="font-semibold text-gray-900">Áreas</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Define la estructura organizacional: áreas, departamentos, direcciones.
          </p>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500">áreas creadas</p>
        </div>

        {/* Cargos */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">👤</span>
            <h3 className="font-semibold text-gray-900">Cargos</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Crea y gestiona cargos con descripción, competencias y jerarquía.
          </p>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500">cargos definidos</p>
        </div>

        {/* Usuarios */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">👥</span>
            <h3 className="font-semibold text-gray-900">Usuarios</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Gestiona usuarios, asigna roles y vincula a cargos.
          </p>
          <p className="text-2xl font-bold text-gray-900">1</p>
          <p className="text-xs text-gray-500">usuarios activos</p>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📄</span>
            <h3 className="font-semibold text-gray-900">Documentos</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Documentos organizacionales cargados en el sistema.
          </p>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500">documentos</p>
        </div>

        {/* Configuración IA */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🤖</span>
            <h3 className="font-semibold text-gray-900">Proveedor IA</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configura el proveedor de inteligencia artificial del sistema.
          </p>
          <p className="text-sm font-medium text-amber-600">
            ⚠️ No configurado
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Configura un proveedor para habilitar IA
          </p>
        </div>

        {/* Organización */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏛️</span>
            <h3 className="font-semibold text-gray-900">Organización</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Datos generales de tu organización.
          </p>
          <p className="text-sm font-medium text-gray-900">
            {user?.role || "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">tu rol actual</p>
        </div>
      </div>
    </div>
  );
}
