import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasMinRole } from "@/lib/security/role-guard";
import { ReportesClient } from "./reportes-client";

export default async function ReportesPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user || !hasMinRole(user.role, "JEFE_AREA")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">📑 Reportes</h1>
        <p className="text-gray-600 mt-1">
          Genera reportes de progreso, cumplimiento POA e indicadores KPI.
          Puedes imprimir o exportar a PDF.
        </p>
      </div>

      <ReportesClient userRole={user.role} />
    </div>
  );
}
