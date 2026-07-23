import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/docs — List all documents for the user's organization
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;
  if (!user.organizationId) {
    return NextResponse.json({ documents: [] });
  }

  const documents = await prisma.document.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      format: true,
      status: true,
      chunksCount: true,
      createdAt: true,
      rawText: true,
    },
  });

  // Don't send full rawText in list, just indicate if it has content
  const docsWithMeta = documents.map((d) => ({
    ...d,
    hasContent: !!d.rawText && d.rawText.length > 0,
    contentLength: d.rawText?.length || 0,
    rawText: undefined,
  }));

  return NextResponse.json({ documents: docsWithMeta });
}

/**
 * POST /api/docs — Upload/save a new document (text content)
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;
  if (!user.organizationId) {
    return NextResponse.json({ error: "Sin organización" }, { status: 400 });
  }

  try {
    const { name, type, content, format } = await request.json();

    if (!name || !content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Nombre y contenido requeridos (mínimo 10 caracteres)" },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        name,
        type: type || "OTRO",
        format: format || "TEXT",
        rawText: content,
        status: "READY",
        organizationId: user.organizationId,
        uploadedById: user.id,
      },
    });

    return NextResponse.json({
      id: document.id,
      name: document.name,
      type: document.type,
      message: "Documento guardado correctamente",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Document save error:", error);
    return NextResponse.json(
      { error: "Error al guardar documento" },
      { status: 500 }
    );
  }
}
