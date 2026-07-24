import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/actividades/[id] — Update activity status
 * States: pendiente → en_curso → terminado
 * Auto-updates parent Objetivo estado when all activities are completed.
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

    // Auto-update parent Objetivo estado based on activity completion
    const allActivities = await prisma.actividad.findMany({
      where: { objetivoId: actividad.objetivoId },
    });

    const totalActivities = allActivities.length;
    const completedActivities = allActivities.filter(
      (a) => a.id === id ? estado === "terminado" : a.completada
    ).length;
    const inProgressActivities = allActivities.filter(
      (a) => a.id === id ? estado === "en_curso" : a.estado === "en_curso"
    ).length;

    // Determine new parent Objetivo estado
    let newObjetivoEstado: string | null = null;
    if (totalActivities > 0 && completedActivities === totalActivities) {
      newObjetivoEstado = "COMPLETADO";
    } else if (completedActivities > 0 || inProgressActivities > 0) {
      newObjetivoEstado = "EN_PROGRESO";
    }

    if (newObjetivoEstado) {
      await prisma.objetivo.update({
        where: { id: actividad.objetivoId },
        data: { estado: newObjetivoEstado as any },
      });
    }

    return NextResponse.json({
      id: updated.id,
      estado: updated.estado,
      completada: updated.completada,
      objetivoId: actividad.objetivoId,
      progreso: {
        completadas: completedActivities,
        total: totalActivities,
        porcentaje: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0,
      },
      objetivoEstado: newObjetivoEstado,
      message: `Actividad actualizada a: ${estado}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
