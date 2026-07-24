import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/actividades-list - List all user's activities with objective info
 * Query params: estado, prioridad, plazo
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const prioridad = searchParams.get("prioridad");
  const plazo = searchParams.get("plazo");

  try {
    const where: any = {
      objetivo: { userId: user.id },
    };

    if (estado) {
      where.estado = estado;
    }
    if (prioridad) {
      where.prioridad = prioridad;
    }
    if (plazo) {
      where.plazoDias = plazo;
    }

    const actividades = await prisma.actividad.findMany({
      where,
      include: {
        objetivo: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            estado: true,
            gestion: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ actividades });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al obtener actividades: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
