import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAIProvider } from "@/lib/ai/providers";
import { ChatMessage } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mensaje requerido" },
        { status: 400 }
      );
    }

    // Read org AI settings from database
    const org = user.organizationId
      ? await prisma.organization.findUnique({
          where: { id: user.organizationId },
          select: { aiProvider: true, aiApiKey: true, ollamaUrl: true },
        })
      : null;

    const provider = createAIProvider(
      org?.aiProvider as any,
      org?.aiApiKey || undefined,
      org?.ollamaUrl || undefined
    );

    if (!provider.capabilities.chat) {
      return NextResponse.json({
        response:
          "El asistente IA no esta configurado. Contacta al administrador para activar un proveedor en Configuracion. Mientras tanto, usa el analisis por patrones en 'Construir Lineamientos'.",
      });
    }

    // Build messages array — limit context to save tokens
    const messages: ChatMessage[] = [
      // Only keep last 4 messages of history to save tokens
      ...(history || []).slice(-4).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Collect streamed response
    let fullResponse = "";
    for await (const chunk of provider.chat(messages)) {
      fullResponse += chunk;
    }

    return NextResponse.json({ response: fullResponse });
  } catch (error: any) {
    console.error("Chat AI error:", error);
    return NextResponse.json(
      { error: error.message || "Error del asistente IA" },
      { status: 500 }
    );
  }
}
