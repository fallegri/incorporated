import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAIProvider } from "@/lib/ai/providers";
import { LineamientoGeneradoSchema } from "@/lib/ai/schemas/lineamiento";
import { AINotAvailableError } from "@/lib/ai/types";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const provider = createAIProvider();

    if (!provider.capabilities.structuredOutput) {
      return NextResponse.json(
        {
          error:
            "La generación de lineamientos requiere un proveedor IA activo. " +
            "Configura Gemini u Ollama en Ajustes.",
        },
        { status: 400 }
      );
    }

    const prompt = `Genera lineamientos estratégicos para un cargo genérico de ejemplo.
    
Cargo: Analista de Proyectos
Área: Planificación y Desarrollo
Descripción: Responsable de analizar, planificar y dar seguimiento a los proyectos del área.
Reporta a: Jefe de Planificación

Genera exactamente:
- 3 a 5 objetivos estratégicos
- 2 a 3 KPIs por cada objetivo
- 3 a 5 actividades por objetivo (con plazo 30/60/90 días)
- 1 plan de inserción a 30/60/90 días
- Documentos sugeridos a consultar
- Observaciones generales`;

    const result = await provider.generateStructured(
      prompt,
      LineamientoGeneradoSchema
    );

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof AINotAvailableError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Lineamientos generation error:", error);
    return NextResponse.json(
      { error: "Error al generar lineamientos: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
