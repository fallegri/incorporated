import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifySync } from "otplib";
import { auditLog } from "@/lib/security";

/**
 * POST /api/auth/2fa/verify — Verify TOTP code and enable 2FA
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json(
        { error: "Código de 6 dígitos requerido" },
        { status: 400 }
      );
    }

    // Get user's secret
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true },
    });

    if (!dbUser?.twoFactorSecret) {
      return NextResponse.json(
        { error: "Primero debes configurar 2FA (obtener QR)" },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const isValid = verifySync({ token: code, secret: dbUser.twoFactorSecret });

    if (!isValid) {
      auditLog("2FA_FAILED", user.id, undefined, { reason: "invalid_code" });
      return NextResponse.json(
        { error: "Código incorrecto. Intenta de nuevo." },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    auditLog("2FA_VERIFIED", user.id, undefined, { enabled: true });

    return NextResponse.json({
      message: "✅ 2FA activado correctamente. A partir de ahora necesitarás el código al iniciar sesión.",
      enabled: true,
    });
  } catch (error: any) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Error al verificar código" },
      { status: 500 }
    );
  }
}
