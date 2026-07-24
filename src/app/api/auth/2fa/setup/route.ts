import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { auditLog } from "@/lib/security";

/**
 * POST /api/auth/2fa/setup — Generate 2FA secret and QR code
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    // Generate secret
    const secret = generateSecret();

    // Generate OTP Auth URL
    const otpauth = generateURI({
      issuer: "Incorporated",
      label: user.email || "user",
      secret,
    });

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(otpauth);

    // Save secret temporarily (not enabled yet until verified)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    auditLog("2FA_ENABLED", user.id, undefined, { step: "setup" });

    return NextResponse.json({
      qrCode,
      secret, // Show to user as backup code
      message: "Escanea el QR con Google Authenticator o Authy, luego ingresa el código para verificar.",
    });
  } catch (error: any) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Error al configurar 2FA" },
      { status: 500 }
    );
  }
}
