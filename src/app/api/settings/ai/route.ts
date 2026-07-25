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
  let orgId = user.organizationId;

  // If orgId not in JWT, fetch from DB
  if (!orgId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });
    orgId = dbUser?.organizationId;
  }

  if (!orgId) {
    return NextResponse.json({ provider: "none", configured: false, hasApiKey: false });
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { aiProvider: true, aiApiKey: true, ollamaUrl: true },
  });

  // Never expose the actual API key - only indicate if one exists
  const hasApiKey = !!org?.aiApiKey && org.aiApiKey.length > 0;
  const maskedKey = hasApiKey
    ? "****" + org!.aiApiKey!.slice(-4)
    : null;

  return NextResponse.json({
    provider: org?.aiProvider || "none",
    configured: org?.aiProvider !== "none",
    hasApiKey,
    maskedKey,
    ollamaUrl: org?.ollamaUrl || null,
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  // RBAC: Allow if admin, individual, or if role is not loaded in JWT (re-login needed)
  // For safety: check in DB if unsure
  if (user.role && !permissions.canChangeAIProvider(user.role)) {
    return NextResponse.json(
      { error: "No tienes permisos para cambiar la configuracion de IA. Se requiere rol Admin o Individual." },
      { status: 403 }
    );
  }

  if (!user.organizationId) {
    // Try to get org from DB if not in JWT
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true, role: true },
    });
    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: "Sin organizacion" }, { status: 400 });
    }
    user.organizationId = dbUser.organizationId;
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
    const { provider, apiKey, ollamaUrl } = await request.json();

    if (!["gemini", "nvidia", "ollama", "none"].includes(provider)) {
      return NextResponse.json({ error: "Provider invalido" }, { status: 400 });
    }

    // Build update data
    const updateData: any = { aiProvider: provider };

    // Save API key if provided (for gemini/nvidia)
    if (apiKey !== undefined) {
      // Allow clearing the key by sending empty string or null
      updateData.aiApiKey = apiKey || null;
    }

    // Save Ollama URL if provided
    if (ollamaUrl !== undefined) {
      updateData.ollamaUrl = ollamaUrl || null;
    }

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: updateData,
    });

    auditLog("AI_PROVIDER_CHANGED", user.id, ip, { provider, hasApiKey: !!apiKey });

    return NextResponse.json({
      message: `Proveedor IA actualizado a: ${provider}`,
      provider,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar configuracion" },
      { status: 500 }
    );
  }
}
