import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Solo administradores pueden publicar la empresa" },
      { status: 403 }
    );
  }

  const orgId = user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Sin organizacion" }, { status: 400 });
  }

  try {
    await prisma.organization.update({
      where: { id: orgId },
      data: { status: "active" },
    });

    return NextResponse.json({
      message: "Empresa publicada exitosamente",
      status: "active",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al publicar la empresa" },
      { status: 500 }
    );
  }
}
