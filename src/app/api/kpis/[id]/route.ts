import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/kpis/[id] - Update KPI valorActual
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
    const { valorActual } = await request.json();

    if (valorActual === undefined || valorActual === null) {
      return NextResponse.json(
        { error: "valorActual es requerido" },
        { status: 400 }
      );
    }

    // Verify the KPI belongs to user's objectives
    const kpi = await prisma.kPI.findFirst({
      where: {
        id,
        objetivo: { userId: user.id },
      },
    });

    if (!kpi) {
      return NextResponse.json({ error: "KPI no encontrado" }, { status: 404 });
    }

    const updated = await prisma.kPI.update({
      where: { id },
      data: { valorActual: String(valorActual) },
    });

    return NextResponse.json({
      id: updated.id,
      nombre: updated.nombre,
      valorActual: updated.valorActual,
      meta: updated.meta,
      message: "KPI actualizado correctamente",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar KPI: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
