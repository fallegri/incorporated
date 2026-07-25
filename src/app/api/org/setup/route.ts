import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Solo administradores pueden configurar la empresa" },
      { status: 403 }
    );
  }

  const orgId = user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Sin organizacion" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, sector, mision, vision } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (sector !== undefined) updateData.sector = sector;
    if (mision !== undefined) updateData.mision = mision;
    if (vision !== undefined) updateData.vision = vision;

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    return NextResponse.json({ message: "Datos actualizados", org });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar datos de la empresa" },
      { status: 500 }
    );
  }
}
