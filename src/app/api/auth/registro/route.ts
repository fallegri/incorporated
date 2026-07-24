import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, getClientIP, RATE_LIMITS, auditLog, sanitizeText } from "@/lib/security";

const RegistroSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
  name: z.string().min(2, "Nombre requerido").max(100),
  mode: z.enum(["enterprise", "individual"]),
  organizationName: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIP(request.headers);
  const rl = checkRateLimit(`registro:${ip}`, RATE_LIMITS.registro);
  if (!rl.allowed) {
    auditLog("RATE_LIMITED", undefined, ip, { endpoint: "registro" });
    return NextResponse.json(
      { error: "Demasiados intentos de registro. Intenta más tarde." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const data = RegistroSchema.parse(body);

    // Sanitize inputs
    const cleanName = sanitizeText(data.name, 100);
    const cleanOrgName = data.organizationName ? sanitizeText(data.organizationName, 200) : undefined;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(data.password, 12);

    // Create org + user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: cleanOrgName || `Org de ${cleanName}`,
          mode: data.mode,
          aiProvider: "none",
        },
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          name: cleanName,
          passwordHash,
          role: data.mode === "enterprise" ? "ADMIN" : "INDIVIDUAL",
          organizationId: org.id,
        },
      });

      return { user, org };
    });

    auditLog("REGISTER", result.user.id, ip, { mode: data.mode });

    return NextResponse.json(
      {
        message: "Registro exitoso",
        userId: result.user.id,
        organizationId: result.org.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: (error as any).issues || error.message },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
