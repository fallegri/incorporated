import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/settings/ai — Get current AI configuration for the org
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;
  if (!user.organizationId) {
    return NextResponse.json({ provider: "none", configured: false });
  }

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { aiProvider: true },
  });

  return NextResponse.json({
    provider: org?.aiProvider || "none",
    configured: org?.aiProvider !== "none",
    // Don't expose the actual key, just whether one exists
    hasApiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
}

/**
 * PUT /api/settings/ai — Update AI provider for the org
 */
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;
  if (!user.organizationId) {
    return NextResponse.json({ error: "Sin organización" }, { status: 400 });
  }

  try {
    const { provider } = await request.json();

    if (!["gemini", "ollama", "none"].includes(provider)) {
      return NextResponse.json({ error: "Provider inválido" }, { status: 400 });
    }

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: { aiProvider: provider },
    });

    return NextResponse.json({
      message: `Proveedor IA actualizado a: ${provider}`,
      provider,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar: " + error.message },
      { status: 500 }
    );
  }
}
