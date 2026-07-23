import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/docs/analyze/save
 * Saves analyzed objectives and KPIs to the database.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const { objetivos, kpis } = await request.json();

    if (!objetivos?.length && !kpis?.length) {
      return NextResponse.json(
        { error: "No hay objetivos ni KPIs para guardar" },
        { status: 400 }
      );
    }

    // Get or create a cargo for the user
    let cargoId = user.cargoId;

    if (!cargoId) {
      // Create a default cargo if user doesn't have one
      const cargo = await prisma.cargo.create({
        data: {
          name: "Mi Cargo",
          description: "Cargo generado automáticamente",
          organizationId: user.organizationId,
        },
      });
      cargoId = cargo.id;

      // Assign cargo to user
      await prisma.user.update({
        where: { id: user.id },
        data: { cargoId: cargo.id },
      });
    }

    // Save objectives
    let savedObjetivos = 0;
    if (objetivos?.length) {
      for (const obj of objetivos) {
        const objetivo = await prisma.objetivo.create({
          data: {
            titulo: obj.titulo,
            descripcion: obj.descripcion || obj.titulo,
            tipo: obj.tipo === "estratégico" ? "ESTRATEGICO" : "OPERATIVO",
            estado: "BORRADOR",
            generadoPorIA: false,
            cargoId,
            userId: user.id,
          },
        });

        // Save associated activities
        if (obj.actividades?.length) {
          for (const act of obj.actividades) {
            await prisma.actividad.create({
              data: {
                descripcion: typeof act === "string" ? act : act.descripcion,
                plazoDias: "60",
                prioridad: "media",
                objetivoId: objetivo.id,
              },
            });
          }
        }

        savedObjetivos++;
      }
    }

    // Save KPIs (linked to first objective or create generic one)
    let savedKpis = 0;
    if (kpis?.length) {
      // Get first objective to link KPIs
      const firstObjetivo = await prisma.objetivo.findFirst({
        where: { cargoId, userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (firstObjetivo) {
        for (const kpi of kpis) {
          await prisma.kPI.create({
            data: {
              nombre: kpi.nombre || kpi.nomenclatura,
              metrica: kpi.formula || kpi.metrica || "",
              meta: kpi.condiciones?.[0]?.valor || "Por definir",
              frecuencia: "trimestral",
              objetivoId: firstObjetivo.id,
            },
          });
          savedKpis++;
        }
      }
    }

    return NextResponse.json({
      message: `Guardado: ${savedObjetivos} objetivos y ${savedKpis} KPIs`,
      savedObjetivos,
      savedKpis,
    });
  } catch (error: any) {
    console.error("Save analysis error:", error);
    return NextResponse.json(
      { error: "Error al guardar: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
