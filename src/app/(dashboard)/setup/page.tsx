import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SetupWizardClient } from "@/components/setup/setup-wizard-client";

export default async function SetupPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const orgId = user.organizationId;
  if (!orgId) {
    redirect("/dashboard");
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      status: true,
      sector: true,
      mision: true,
      vision: true,
      aiProvider: true,
      mode: true,
    },
  });

  if (!org || org.status === "active") {
    redirect("/dashboard");
  }

  // Get existing documents for the org
  const documents = await prisma.document.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, type: true, status: true },
  });

  // Get areas and cargos
  const areas = await prisma.area.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
  });

  const cargos = await prisma.cargo.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
  });

  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <SetupWizardClient
      org={{
        id: org.id,
        name: org.name,
        sector: org.sector || "",
        mision: org.mision || "",
        vision: org.vision || "",
        aiProvider: org.aiProvider,
      }}
      documents={documents}
      areas={areas}
      cargos={cargos}
      users={users}
    />
  );
}
