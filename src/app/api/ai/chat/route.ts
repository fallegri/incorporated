import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAIProvider } from "@/lib/ai/providers";
import { ChatMessage } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mensaje requerido" },
        { status: 400 }
      );
    }

    const provider = createAIProvider();

    if (!provider.capabilities.chat) {
      return NextResponse.json({
        response:
          "El asistente IA no está configurado. Contacta al administrador para activar un proveedor (Gemini u Ollama).",
      });
    }

    // Build messages array
    const messages: ChatMessage[] = [
      ...(history || []).map((m: any) => ({
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
