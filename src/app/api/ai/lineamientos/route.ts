import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAIProvider } from "@/lib/ai/providers";
import { LineamientoGeneradoSchema } from "@/lib/ai/schemas/lineamiento";
import { AINotAvailableError } from "@/lib/ai/types";
import { prepareForAI } from "@/lib/services/document-to-md";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    // Read org AI settings from database
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { aiProvider: true, aiApiKey: true, ollamaUrl: true },
    });

    const provider = createAIProvider(
      org?.aiProvider as any,
      org?.aiApiKey || undefined,
      org?.ollamaUrl || undefined
    );

    if (!provider.capabilities.structuredOutput) {
      return NextResponse.json(
        { error: "La generacion con IA requiere un proveedor configurado. Ve a Configuracion para registrar tu API key." },
        { status: 400 }
      );
    }

    // Get user's documents from DB
    const documents = await prisma.document.findMany({
      where: {
        organizationId: user.organizationId,
        rawText: { not: null },
      },
      select: { name: true, type: true, rawText: true },
      take: 5, // Max 5 docs
    });

    if (!documents.length || !documents.some((d) => d.rawText)) {
      return NextResponse.json(
        { error: "No hay documentos cargados. Sube al menos un PEI o FODA primero." },
        { status: 400 }
      );
    }

    // Convert documents to condensed markdown BEFORE sending to AI
    // This saves tokens dramatically (from 50 pages → ~2 pages)
    let contextMd = "";
    let totalTokens = 0;

    for (const doc of documents) {
      if (!doc.rawText) continue;
      const prepared = prepareForAI(doc.rawText, `${doc.name} (${doc.type})`);
      contextMd += prepared.markdown + "\n\n---\n\n";
      totalTokens += prepared.estimatedTokens;

      // Don't exceed ~4000 tokens of context
      if (totalTokens > 4000) break;
    }

    // Get cargo info if available
    let cargoInfo = "";
    if (user.cargoId) {
      const cargo = await prisma.cargo.findUnique({
        where: { id: user.cargoId },
        select: { name: true, description: true },
      });
      if (cargo) {
        cargoInfo = `\nCargo del usuario: ${cargo.name}\nDescripción: ${cargo.description || "No definida"}`;
      }
    }

    // Build prompt — concise, structured
    const prompt = `Basándote en el siguiente resumen de documentos estratégicos, genera lineamientos para el cargo.
${cargoInfo}

DOCUMENTOS (resumen en Markdown):
${contextMd}

INSTRUCCIONES:
- Genera 3 a 5 objetivos estratégicos basados en los documentos
- Cada objetivo debe tener 2-3 KPIs medibles
- Cada objetivo debe tener 3-5 actividades con plazo (30, 60 o 90 días)
- Genera un plan de inserción a 30/60/90 días
- Sugiere documentos adicionales si detectas que faltan
- Responde SOLO en JSON válido según el schema`;

    const result = await provider.generateStructured(
      prompt,
      LineamientoGeneradoSchema,
      {
        chunks: [],
        cargoInfo: cargoInfo ? { nombre: "Usuario", area: "General", descripcion: cargoInfo } : undefined,
      }
    );

    return NextResponse.json({
      ...result,
      _meta: {
        documentsUsed: documents.length,
        tokensEstimated: totalTokens,
        model: "gemini-2.0-flash",
      },
    });
  } catch (error: any) {
    if (error instanceof AINotAvailableError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle quota errors specifically
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return NextResponse.json(
        { error: "Cuota de IA agotada por hoy. Intenta mañana o usa el análisis por patrones (sin IA) que no tiene límite." },
        { status: 429 }
      );
    }

    console.error("Lineamientos generation error:", error);
    return NextResponse.json(
      { error: "Error al generar lineamientos: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
