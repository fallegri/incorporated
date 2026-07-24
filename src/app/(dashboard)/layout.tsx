import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

async function getAlertCount(userId: string): Promise<number> {
  try {
    let count = 0;

    // Count overdue or near-due activities
    const actividades = await prisma.actividad.findMany({
      where: {
        objetivo: { userId },
        completada: false,
      },
      select: { plazoDias: true, createdAt: true },
    });

    const now = new Date();
    for (const act of actividades) {
      const plazoDias = parseInt(act.plazoDias) || 0;
      const deadline = new Date(act.createdAt.getTime() + plazoDias * 24 * 60 * 60 * 1000);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7) count++;
    }

    // Count KPIs in red zone
    const kpis = await prisma.kPI.findMany({
      where: { objetivo: { userId } },
      select: { meta: true, valorActual: true },
    });

    for (const kpi of kpis) {
      const meta = parseFloat(kpi.meta);
      const actual = parseFloat(kpi.valorActual || "0");
      if (!isNaN(meta) && meta > 0 && (actual / meta) * 100 < 50) {
        count++;
      }
    }

    return count;
  } catch {
    return 0;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const alertCount = user?.id ? await getAlertCount(user.id) : 0;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} alertCount={alertCount} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
