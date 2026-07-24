import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifySync } from "otplib";
import { auditLog } from "@/lib/security";

/**
 * POST /api/auth/2fa/disable — Disable 2FA (requires current code)
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const { code } = await request.json();

    // Get user's secret
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!dbUser?.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA no está activado" }, { status: 400 });
    }

    // Verify code before disabling
    const isValid = verifySync({ token: code, secret: dbUser.twoFactorSecret! });

    if (!isValid) {
      auditLog("2FA_FAILED", user.id, undefined, { reason: "invalid_code_disable" });
      return NextResponse.json({ error: "Código incorrecto" }, { status: 400 });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    auditLog("2FA_ENABLED", user.id, undefined, { enabled: false });

    return NextResponse.json({ message: "2FA desactivado", enabled: false });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al desactivar 2FA" }, { status: 500 });
  }
}
