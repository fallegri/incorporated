import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/actividades/[id] — Update activity status
 * States: pendiente → en_curso → terminado
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as any;

  try {
    const { estado } = await request.json();

    if (!["pendiente", "en_curso", "terminado"].includes(estado)) {
      return NextResponse.json(
        { error: "Estado inválido. Usa: pendiente, en_curso, terminado" },
        { status: 400 }
      );
    }

    // Verify the activity belongs to user's objectives
    const actividad = await prisma.actividad.findFirst({
      where: {
        id,
        objetivo: { userId: user.id },
      },
    });

    if (!actividad) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    const updated = await prisma.actividad.update({
      where: { id },
      data: {
        estado,
        completada: estado === "terminado",
        completadaAt: estado === "terminado" ? new Date() : null,
      },
    });

    return NextResponse.json({
      id: updated.id,
      estado: updated.estado,
      completada: updated.completada,
      message: `Actividad actualizada a: ${estado}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
