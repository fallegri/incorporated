"use client";

import { useState, useEffect } from "react";

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  role: string;
  cargo: string;
  totalObjetivos: number;
  objetivosCompletados: number;
  totalActividades: number;
  actividadesCompletadas: number;
  actividadesEnCurso: number;
  actividadesPendientes: number;
  progresoGeneral: number;
  totalKpis: number;
}

interface ManagerData {
  resumen: {
    totalEmpleados: number;
    progresoPromedio: number;
    totalObjetivos: number;
    objetivosCompletados: number;
  };
  empleados: EmployeeData[];
}

export function ManagerView() {
  const [data, setData] = useState<ManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/gerente");
        if (!res.ok) {
          const json = await res.json();
          setError(json.error || "Error al cargar datos");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Error de conexion");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <p className="text-gray-500">Cargando datos de equipo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.resumen.totalEmpleados}
              </p>
              <p className="text-sm text-gray-500">Empleados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.resumen.totalObjetivos}
              </p>
              <p className="text-sm text-gray-500">Objetivos totales</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.resumen.objetivosCompletados}
              </p>
              <p className="text-sm text-gray-500">Completados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.resumen.progresoPromedio}%
              </p>
              <p className="text-sm text-gray-500">Progreso promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employees table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Progreso por Empleado
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Vista general del avance de objetivos y cumplimiento de tareas
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Empleado
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Cargo
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  Objetivos
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  Tareas
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  Progreso
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {emp.cargo}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-gray-900">
                      {emp.objetivosCompletados}
                    </span>
                    <span className="text-gray-400">
                      /{emp.totalObjetivos}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className="text-xs text-green-700"
                        title="Completadas"
                      >
                        {emp.actividadesCompletadas}
                      </span>
                      <span className="text-gray-300">/</span>
                      <span className="text-xs text-gray-700" title="Total">
                        {emp.totalActividades}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {emp.actividadesEnCurso} en curso,{" "}
                      {emp.actividadesPendientes} pendientes
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            emp.progresoGeneral >= 80
                              ? "bg-green-500"
                              : emp.progresoGeneral >= 50
                              ? "bg-yellow-500"
                              : emp.progresoGeneral > 0
                              ? "bg-orange-400"
                              : "bg-gray-300"
                          }`}
                          style={{ width: `${emp.progresoGeneral}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-10 text-right">
                        {emp.progresoGeneral}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.empleados.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">
              No hay empleados con objetivos asignados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
