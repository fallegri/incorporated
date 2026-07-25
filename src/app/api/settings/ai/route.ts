import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { permissions, auditLog, checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/security";

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
    hasApiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  // RBAC: Only admins can change AI provider
  if (!permissions.canChangeAIProvider(user.role)) {
    return NextResponse.json(
      { error: "No tienes permisos para cambiar la configuración de IA. Se requiere rol Admin." },
      { status: 403 }
    );
  }

  // Rate limiting
  const ip = getClientIP(request.headers);
  const rl = checkRateLimit(`settings:${user.id}`, RATE_LIMITS.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en unos segundos." },
      { status: 429 }
    );
  }

  try {
    const { provider } = await request.json();

    if (!["gemini", "nvidia", "ollama", "none"].includes(provider)) {
      return NextResponse.json({ error: "Provider inválido" }, { status: 400 });
    }

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: { aiProvider: provider },
    });

    auditLog("AI_PROVIDER_CHANGED", user.id, ip, { provider });

    return NextResponse.json({
      message: `Proveedor IA actualizado a: ${provider}`,
      provider,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
