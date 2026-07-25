import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;
  const orgId = user.organizationId;

  if (!orgId) {
    return NextResponse.json({ status: "no_org" });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { status: true, name: true, mode: true },
    });

    if (!org) {
      return NextResponse.json({ status: "no_org" });
    }

    return NextResponse.json({
      status: org.status,
      name: org.name,
      mode: org.mode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al obtener estado" },
      { status: 500 }
    );
  }
}
