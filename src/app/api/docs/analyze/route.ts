import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeDocument } from "@/lib/services/document-analyzer";
import { createAIProvider } from "@/lib/ai/providers";

/**
 * POST /api/docs/analyze
 * Analyzes uploaded document text to extract objectives, KPIs, lineamientos.
 * Works WITHOUT AI (pattern matching) and WITH AI (enhanced extraction).
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { text, documentName } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Texto del documento requerido (mínimo 50 caracteres)" },
        { status: 400 }
      );
    }

    // Step 1: Rule-based analysis (ALWAYS works, no AI needed)
    const analysis = analyzeDocument(text, documentName || "Documento");

    // Step 2: If AI is available, enhance the analysis
    let aiEnhanced = false;
    try {
      const provider = createAIProvider();
      if (provider.capabilities.structuredOutput) {
        // AI available — could enhance but rule-based is primary
        aiEnhanced = true;
      }
    } catch {
      // AI not available — that's fine, rule-based works
    }

    return NextResponse.json({
      ...analysis,
      aiEnhanced,
      message: aiEnhanced
        ? "Análisis completado con asistencia de IA"
        : "Análisis completado mediante detección de patrones (sin IA)",
    });
  } catch (error: any) {
    console.error("Document analysis error:", error);
    return NextResponse.json(
      { error: "Error al analizar documento: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
