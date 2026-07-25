import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function CargoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;

  // Fetch full user data with cargo and area from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      cargo: {
        include: {
          area: true,
        },
      },
      organization: true,
    },
  });

  const cargo = dbUser?.cargo;
  const area = cargo?.area;
  const isEnterprise = dbUser?.organization?.mode === "enterprise";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">📋 Checklist Onboarding</h1>
        <p className="text-gray-600 mt-1">
          Informacion sobre tu posicion, competencias y ubicacion en la organizacion.
        </p>
      </div>

      {/* Cargo info card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Informacion del Cargo
          </h2>
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <a
              href="/admin/configuracion"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Editar →
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Cargo</p>
            <p className="text-sm text-gray-900 mt-1 font-medium">
              {cargo?.name || "Sin asignar"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Area</p>
            <p className="text-sm text-gray-900 mt-1 font-medium">
              {area?.name || "Sin asignar"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Reporta a</p>
            <p className="text-sm text-gray-900 mt-1">
              {cargo?.reportsTo || "No definido"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 uppercase">Rol en el sistema</p>
            <p className="text-sm text-gray-900 mt-1 capitalize">
              {user?.role?.toLowerCase().replace("_", " ") || "No definido"}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-xs font-medium text-gray-500 uppercase">Descripcion del cargo</p>
          <p className={`text-sm mt-1 ${cargo?.description ? "text-gray-900" : "text-gray-500 italic"}`}>
            {cargo?.description || "No hay descripcion definida. El encargado de Desarrollo Humano debe cargar el Manual de Funciones."}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-xs font-medium text-gray-500 uppercase">Competencias requeridas</p>
          {cargo?.competencias && cargo.competencias.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {cargo.competencias.map((comp: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {comp}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic mt-1">
              No hay competencias definidas. Se extraen del Manual de Funciones.
            </p>
          )}
        </div>
      </div>

      {/* Enterprise onboarding flow */}
      {isEnterprise && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Flujo de Onboarding Empresarial
          </h2>
          <p className="text-sm text-gray-600">
            En modo empresa, la carga de informacion sigue un orden por roles:
          </p>

          <div className="space-y-3">
            {/* Step 1: Desarrollo Humano */}
            <div className="border rounded-lg p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded">PASO 1</span>
                <h3 className="font-semibold text-gray-900 text-sm">Encargado de Desarrollo Humano</h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Primera persona en configurar la empresa. Debe cargar:
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">&#9679;</span>
                  <strong>Manual de Organizacion y Funciones (MOF)</strong> - Define cargos, competencias, funciones
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">&#9679;</span>
                  <strong>Organigrama</strong> - Define la estructura jerarquica y areas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">&#9679;</span>
                  <strong>Estructura organizacional</strong> - Relaciones de reporte y dependencias
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">&#9679;</span>
                  <strong>Reglamento interno</strong> - Normas y politicas de la organizacion
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">&#9679;</span>
                  <strong>Perfiles de cargo</strong> - Requisitos, experiencia y formacion por puesto
                </li>
              </ul>
            </div>

            {/* Step 2: Gerente/Admin */}
            <div className="border rounded-lg p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">PASO 2</span>
                <h3 className="font-semibold text-gray-900 text-sm">Gerente / Administrador</h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Carga los documentos de direccion estrategica:
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <strong>Plan Estrategico Institucional (PEI)</strong> - Mision, vision, ejes estrategicos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <strong>Plan Operativo Anual (POA)</strong> - Objetivos y metas del periodo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <strong>Analisis FODA</strong> - Fortalezas, oportunidades, debilidades, amenazas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <strong>Lineamientos institucionales</strong> - Politicas y directrices de gestion
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <strong>Presupuesto operativo</strong> - Asignacion de recursos por area
                </li>
              </ul>
            </div>

            {/* Step 3: Regular employee */}
            <div className="border rounded-lg p-4 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">PASO 3</span>
                <h3 className="font-semibold text-gray-900 text-sm">Colaborador</h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Al registrarse, ya tiene datos pre-cargados:
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#9679;</span>
                  Cargo asignado con descripcion y competencias (del MOF)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#9679;</span>
                  Area y estructura jerarquica (del Organigrama)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#9679;</span>
                  Relaciones de reporte (del MOF y Organigrama)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#9679;</span>
                  Documentos estrategicos disponibles para consulta
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#9679;</span>
                  Puede usar "Construir Lineamientos" con IA para generar objetivos personalizados
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Individual mode info */}
      {!isEnterprise && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Modo Individual</h3>
          <p className="text-sm text-gray-700">
            En modo individual, tu cargas tus propios documentos (plan de negocio, objetivos, etc.)
            y la IA genera lineamientos personalizados basados en tu contexto.
          </p>
        </div>
      )}

      {/* Suggested additional docs */}
      {isEnterprise && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">
            Documentos sugeridos adicionales
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            Para un onboarding completo, el encargado de Desarrollo Humano puede tambien cargar:
          </p>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>&#8226; Manual de procedimientos internos</li>
            <li>&#8226; Codigo de etica y conducta</li>
            <li>&#8226; Plan de capacitacion anual</li>
            <li>&#8226; Evaluacion de desempeno (formato y criterios)</li>
            <li>&#8226; Matriz de competencias por nivel</li>
            <li>&#8226; Politica de compensaciones y beneficios</li>
            <li>&#8226; Mapa de procesos institucional</li>
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> {isEnterprise
            ? "Si tu cargo ya esta configurado, ve a 'Construir Lineamientos' para que la IA genere objetivos, KPIs y actividades alineados a la estrategia de tu organizacion."
            : "Define tu cargo, sube tus documentos (PEI, FODA) y usa 'Construir Lineamientos' para que la IA genere objetivos personalizados."}
        </p>
      </div>
    </div>
  );
}
