import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const RegistroSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  name: z.string().min(2, "Nombre requerido"),
  mode: z.enum(["enterprise", "individual"]),
  organizationName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = RegistroSchema.parse(body);

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
      // Create organization
      const org = await tx.organization.create({
        data: {
          name: data.organizationName || `Org de ${data.name}`,
          mode: data.mode,
          aiProvider: "none", // Default: sin IA hasta que configure
        },
      });

      // Create user with admin role
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
          role: data.mode === "enterprise" ? "ADMIN" : "INDIVIDUAL",
          organizationId: org.id,
        },
      });

      return { user, org };
    });

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
