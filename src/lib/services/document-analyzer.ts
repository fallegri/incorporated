/**
 * Document Analyzer — Extracts strategic objectives, KPIs
 * and activities from uploaded documents WITHOUT requiring AI.
 *
 * Uses pattern matching, keyword detection and structural
 * analysis to identify organizational elements.
 *
 * Works in ALL modes: gemini, ollama, and none.
 */

export interface ExtractedObjective {
  titulo: string;
  descripcion: string;
  tipo: "estratégico" | "operativo";
  source: string;
  confidence: "alta" | "media" | "baja";
  actividades: string[];
}

export interface ExtractedKPI {
  nomenclatura: string;
  nombre: string;
  objetivo: string;
  formula: string;
  condiciones: { label: string; valor: string }[];
  perspectiva: string;
  source: string;
}

export interface ExtractedLineamiento {
  titulo: string;
  descripcion: string;
  objetivos_asociados: string[];
  source: string;
}

export interface DocumentAnalysis {
  objetivos: ExtractedObjective[];
  kpis: ExtractedKPI[];
  lineamientos: ExtractedLineamiento[];
  perspectivas: string[];
  resumen: string;
  metadata: {
    totalParagraphs: number;
    detectedSections: string[];
    documentType: string;
  };
}

// Keywords that indicate strategic objectives
const OBJECTIVE_VERBS = [
  "potenciar", "establecer", "consolidar", "fortalecer",
  "incrementar", "mejorar", "optimizar", "garantizar",
  "implementar", "desarrollar", "promover", "asegurar",
  "reducir", "disminuir", "bajar", "minimizar",
  "maximizar", "lograr", "alcanzar", "mantener",
  "generar", "crear", "diseñar", "definir",
];

// Patterns for KPI detection
const KPI_PATTERNS = {
  nomenclatura: /nomenclatura[:\s]*(\w+)/i,
  nombre: /nombre[:\s]*(.+?)(?:\n|$)/i,
  objetivo: /objetivo[:\s]*(.+?)(?:\n|fórmula|formula|$)/i,
  formula: /f[oó]rmula[=:\s]*(.+?)(?:\n|condici[oó]n|$)/i,
  condicion: /condici[oó]n[:\s]*([\s\S]+?)(?:\n\n|nomenclatura|$)/i,
};

// Section header patterns
const SECTION_PATTERNS = [
  /objetivos?\s*estrat[eé]gicos?/i,
  /perspectiva\s+(del\s+)?cliente/i,
  /perspectiva\s+interna/i,
  /perspectiva\s+financiera/i,
  /identificaci[oó]n\s+de\s+kpi/i,
  /definici[oó]n\s+de\s+objetivos/i,
  /dimensiones?\s+del\s+(icm|cmi|bsc)/i,
  /lineamientos?\s*(estrat[eé]gicos?)?/i,
  /plan\s+estrat[eé]gico/i,
  /misi[oó]n/i,
  /visi[oó]n/i,
  /foda|dofa/i,
];

/**
 * Main analysis function — works without AI
 */
export function analyzeDocument(text: string, documentName: string): DocumentAnalysis {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 10);
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  // Detect sections
  const detectedSections = detectSections(text);

  // Extract objectives
  const objetivos = extractObjectives(text, documentName);

  // Extract KPIs
  const kpis = extractKPIs(text, documentName);

  // Extract lineamientos/guidelines
  const lineamientos = extractLineamientos(text, documentName);

  // Detect perspectives
  const perspectivas = detectPerspectives(text);

  // Determine document type
  const documentType = detectDocumentType(text);

  // Generate summary
  const resumen = generateSummary(objetivos, kpis, perspectivas, documentType);

  return {
    objetivos,
    kpis,
    lineamientos,
    perspectivas,
    resumen,
    metadata: {
      totalParagraphs: paragraphs.length,
      detectedSections,
      documentType,
    },
  };
}

function detectSections(text: string): string[] {
  const found: string[] = [];
  for (const pattern of SECTION_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) found.push(match[0].trim());
    }
  }
  return [...new Set(found)];
}

function extractObjectives(text: string, source: string): ExtractedObjective[] {
  const objectives: ExtractedObjective[] = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty or too short
    if (line.length < 15) continue;

    // Remove bullet markers
    const cleanLine = line.replace(/^[·•\-\*\d]+[.\)]\s*/, "").trim();
    const lowerLine = cleanLine.toLowerCase();

    // Check if line starts with an objective verb
    const isObjective = OBJECTIVE_VERBS.some(
      (verb) => lowerLine.startsWith(verb) || lowerLine.startsWith("· " + verb)
    );

    if (isObjective && cleanLine.length > 20 && cleanLine.length < 200) {
      // Look for associated activities (bullets below)
      const actividades: string[] = [];
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const actLine = lines[j].trim();
        if (
          actLine.startsWith("·") ||
          actLine.startsWith("•") ||
          actLine.startsWith("-") ||
          actLine.match(/^\d+[\.\)]/)
        ) {
          const cleanAct = actLine.replace(/^[·•\-\*\d]+[.\)]\s*/, "").trim();
          if (cleanAct.length > 10 && cleanAct.length < 300) {
            actividades.push(cleanAct);
          }
        } else if (actLine.length > 0 && !actLine.match(/^[a-z]\.|^\d+\./)) {
          break; // End of activities block
        }
      }

      // Determine type
      const tipo: "estratégico" | "operativo" =
        lowerLine.includes("estratégic") ||
        OBJECTIVE_VERBS.slice(0, 8).some((v) => lowerLine.startsWith(v))
          ? "estratégico"
          : "operativo";

      // Confidence based on context
      const confidence: "alta" | "media" | "baja" =
        actividades.length > 0 ? "alta" : cleanLine.length > 50 ? "media" : "baja";

      objectives.push({
        titulo: cleanLine,
        descripcion: actividades.length > 0
          ? `Incluye ${actividades.length} actividades asociadas`
          : cleanLine,
        tipo,
        source,
        confidence,
        actividades,
      });
    }
  }

  // Deduplicate
  const unique = objectives.filter(
    (obj, idx, arr) =>
      arr.findIndex((o) => o.titulo.toLowerCase() === obj.titulo.toLowerCase()) === idx
  );

  return unique;
}

function extractKPIs(text: string, source: string): ExtractedKPI[] {
  const kpis: ExtractedKPI[] = [];

  // Split text into blocks that might be KPI definitions
  const blocks = text.split(/(?=nomenclatura[:\s])/i);

  for (const block of blocks) {
    if (!block.match(/nomenclatura/i)) continue;

    const nomenclaturaMatch = block.match(KPI_PATTERNS.nomenclatura);
    const nombreMatch = block.match(KPI_PATTERNS.nombre);
    const objetivoMatch = block.match(KPI_PATTERNS.objetivo);
    const formulaMatch = block.match(KPI_PATTERNS.formula);

    if (nomenclaturaMatch && nombreMatch) {
      // Extract conditions
      const condiciones: { label: string; valor: string }[] = [];
      const condMatch = block.match(KPI_PATTERNS.condicion);
      if (condMatch) {
        const condLines = condMatch[1].split("\n").filter((l) => l.trim());
        for (const cl of condLines) {
          const clean = cl.trim();
          if (clean.length > 3 && clean.length < 100) {
            if (clean.toLowerCase().includes("óptimo") || clean.toLowerCase().includes("optimo")) {
              condiciones.push({ label: "Óptimo", valor: clean });
            } else if (clean.toLowerCase().includes("aceptable")) {
              condiciones.push({ label: "Aceptable", valor: clean });
            } else if (clean.toLowerCase().includes("rechazado")) {
              condiciones.push({ label: "Rechazado", valor: clean });
            } else {
              condiciones.push({ label: "Condición", valor: clean });
            }
          }
        }
      }

      // Detect perspective
      let perspectiva = "General";
      const textBefore = text.substring(0, text.indexOf(block)).toLowerCase();
      if (textBefore.lastIndexOf("perspectiva financiera") > textBefore.lastIndexOf("perspectiva")) {
        perspectiva = "Financiera";
      } else if (textBefore.lastIndexOf("perspectiva interna") > textBefore.lastIndexOf("perspectiva del cliente")) {
        perspectiva = "Interna";
      } else if (textBefore.includes("perspectiva del cliente")) {
        perspectiva = "Cliente";
      }

      kpis.push({
        nomenclatura: nomenclaturaMatch[1].trim(),
        nombre: nombreMatch[1].trim(),
        objetivo: objetivoMatch ? objetivoMatch[1].trim() : "",
        formula: formulaMatch ? formulaMatch[1].trim().replace(/\s+/g, " ") : "",
        condiciones,
        perspectiva,
        source,
      });
    }
  }

  return kpis;
}

function extractLineamientos(text: string, source: string): ExtractedLineamiento[] {
  const lineamientos: ExtractedLineamiento[] = [];
  const lowerText = text.toLowerCase();

  // Look for perspective sections as lineamientos
  const perspectives = [
    { pattern: /perspectiva del cliente[^]*?(?=perspectiva|$)/i, nombre: "Perspectiva del Cliente" },
    { pattern: /perspectiva interna[^]*?(?=perspectiva|$)/i, nombre: "Perspectiva Interna" },
    { pattern: /perspectiva financiera[^]*?(?=\d+\.|$)/i, nombre: "Perspectiva Financiera" },
  ];

  for (const persp of perspectives) {
    const match = text.match(persp.pattern);
    if (match) {
      const sectionText = match[0];
      const objectives = sectionText
        .split("\n")
        .filter((l) => l.trim().startsWith("·") || l.trim().startsWith("•"))
        .map((l) => l.replace(/^[·•\-]\s*/, "").trim())
        .filter((l) => l.length > 15);

      if (objectives.length > 0) {
        lineamientos.push({
          titulo: persp.nombre,
          descripcion: `${objectives.length} lineamientos identificados en esta perspectiva`,
          objetivos_asociados: objectives.slice(0, 10),
          source,
        });
      }
    }
  }

  return lineamientos;
}

function detectPerspectives(text: string): string[] {
  const perspectives: string[] = [];
  if (/perspectiva\s+(del\s+)?cliente/i.test(text)) perspectives.push("Cliente");
  if (/perspectiva\s+interna/i.test(text)) perspectives.push("Interna");
  if (/perspectiva\s+financiera/i.test(text)) perspectives.push("Financiera");
  if (/perspectiva\s+de\s+aprendizaje/i.test(text)) perspectives.push("Aprendizaje y Crecimiento");
  return perspectives;
}

function detectDocumentType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("plan estratégico") || lower.includes("planificación estratégica")) return "PEI";
  if (lower.includes("foda") || lower.includes("dofa") || lower.includes("fortalezas")) return "FODA";
  if (lower.includes("manual de organización") || lower.includes("manual de funciones")) return "MOF";
  if (lower.includes("plan operativo")) return "POI";
  if (lower.includes("cuadro de mando") || lower.includes("balanced scorecard") || lower.includes("cmi")) return "CMI/BSC";
  if (lower.includes("kpi") || lower.includes("indicador")) return "KPIs";
  return "Documento Organizacional";
}

function generateSummary(
  objetivos: ExtractedObjective[],
  kpis: ExtractedKPI[],
  perspectivas: string[],
  documentType: string
): string {
  const parts: string[] = [];
  parts.push(`Documento tipo: ${documentType}.`);

  if (objetivos.length > 0) {
    parts.push(`Se identificaron ${objetivos.length} objetivos estratégicos.`);
  }
  if (kpis.length > 0) {
    parts.push(`Se detectaron ${kpis.length} KPIs con fórmulas y condiciones.`);
  }
  if (perspectivas.length > 0) {
    parts.push(`Perspectivas: ${perspectivas.join(", ")}.`);
  }

  return parts.join(" ");
}
