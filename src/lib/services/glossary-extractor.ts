/**
 * Glossary Extractor — Extracts institutional terms, acronyms,
 * and definitions from uploaded documents WITHOUT requiring AI.
 *
 * Uses pattern-based extraction to identify:
 * - Acronyms (2-6 uppercase characters)
 * - Terms followed by definitions (colon, dash, or parenthetical patterns)
 * - Common institutional terminology
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
  source: string;
  sourceId: string;
  type: "acronym" | "term";
}

// Common acronyms to skip (generic/noise)
const SKIP_ACRONYMS = new Set([
  "DE", "LA", "EL", "EN", "ES", "UN", "AL", "SE", "SI", "NO",
  "LO", "LE", "ME", "MI", "SU", "YO", "TU", "TE", "NI", "OR",
  "BY", "TO", "OF", "AN", "IF", "IT", "ON", "DO", "AT", "AS",
  "SO", "UP", "HE", "WE", "BE", "IS", "AM",
]);

// Known institutional acronym patterns with common definitions
const KNOWN_ACRONYMS: Record<string, string> = {
  PEI: "Plan Estrategico Institucional",
  POI: "Plan Operativo Institucional",
  FODA: "Fortalezas, Oportunidades, Debilidades y Amenazas",
  DOFA: "Debilidades, Oportunidades, Fortalezas y Amenazas",
  MOF: "Manual de Organizacion y Funciones",
  ROF: "Reglamento de Organizacion y Funciones",
  BSC: "Balanced Scorecard / Cuadro de Mando Integral",
  CMI: "Cuadro de Mando Integral",
  KPI: "Key Performance Indicator / Indicador Clave de Desempeño",
  OKR: "Objectives and Key Results / Objetivos y Resultados Clave",
  RRHH: "Desarrollo Humano",
  TIC: "Tecnologias de la Informacion y Comunicacion",
  ICM: "Indice de Control de Metas",
  POA: "Plan Operativo Anual",
  PESTEL: "Politico, Economico, Social, Tecnologico, Ecologico, Legal",
};

/**
 * Extract glossary terms from document text
 */
export function extractGlossaryFromText(
  text: string,
  documentName: string,
  documentId: string
): GlossaryTerm[] {
  const terms: GlossaryTerm[] = [];
  const seenTerms = new Set<string>();

  // 1. Extract acronyms with definitions (e.g., "PEI (Plan Estrategico)")
  const acronymWithDefPattern = /\b([A-Z]{2,6})\s*[\(\-:]\s*([^)\n]{5,80})/g;
  let match: RegExpExecArray | null;

  while ((match = acronymWithDefPattern.exec(text)) !== null) {
    const acronym = match[1];
    const definition = match[2].replace(/[)]+$/, "").trim();

    if (!SKIP_ACRONYMS.has(acronym) && !seenTerms.has(acronym)) {
      seenTerms.add(acronym);
      terms.push({
        term: acronym,
        definition,
        source: documentName,
        sourceId: documentId,
        type: "acronym",
      });
    }
  }

  // 2. Extract standalone acronyms (ALL CAPS 2-6 chars)
  const standaloneAcronymPattern = /\b([A-Z]{2,6})\b/g;
  while ((match = standaloneAcronymPattern.exec(text)) !== null) {
    const acronym = match[1];
    if (!SKIP_ACRONYMS.has(acronym) && !seenTerms.has(acronym)) {
      seenTerms.add(acronym);
      // Try to find definition from known acronyms
      const knownDef = KNOWN_ACRONYMS[acronym];
      terms.push({
        term: acronym,
        definition: knownDef || `Sigla institucional encontrada en ${documentName}`,
        source: documentName,
        sourceId: documentId,
        type: "acronym",
      });
    }
  }

  // 3. Extract terms with colon-based definitions
  // Pattern: "Term: definition" or "Term - definition"
  const colonDefPattern = /^[\s]*([A-Z][A-Za-z\s\u00C0-\u017F]{3,40})\s*[:]\s*(.{10,200})/gm;
  while ((match = colonDefPattern.exec(text)) !== null) {
    const term = match[1].trim();
    const definition = match[2].trim();

    // Only include if term looks like a proper noun/concept
    if (
      term.length >= 4 &&
      term.length <= 50 &&
      !seenTerms.has(term.toUpperCase()) &&
      !term.match(/^\d/) &&
      definition.length >= 10
    ) {
      seenTerms.add(term.toUpperCase());
      terms.push({
        term,
        definition: definition.substring(0, 200),
        source: documentName,
        sourceId: documentId,
        type: "term",
      });
    }
  }

  // 4. Extract terms in "quotes" or bold patterns followed by descriptions
  const quotedTermPattern = /[""]([A-Za-z\u00C0-\u017F\s]{3,40})[""]\s*[:\-]\s*(.{10,200})/g;
  while ((match = quotedTermPattern.exec(text)) !== null) {
    const term = match[1].trim();
    const definition = match[2].trim();

    if (!seenTerms.has(term.toUpperCase()) && term.length >= 3) {
      seenTerms.add(term.toUpperCase());
      terms.push({
        term,
        definition: definition.substring(0, 200),
        source: documentName,
        sourceId: documentId,
        type: "term",
      });
    }
  }

  return terms;
}

/**
 * Merge and deduplicate terms from multiple documents
 */
export function mergeGlossaryTerms(allTerms: GlossaryTerm[]): GlossaryTerm[] {
  const merged = new Map<string, GlossaryTerm>();

  for (const term of allTerms) {
    const key = term.term.toUpperCase();
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, term);
    } else {
      // Prefer definitions that are more descriptive (longer)
      if (
        term.definition.length > existing.definition.length &&
        !term.definition.includes("Sigla institucional encontrada")
      ) {
        merged.set(key, term);
      }
    }
  }

  // Sort alphabetically
  return Array.from(merged.values()).sort((a, b) =>
    a.term.localeCompare(b.term, "es")
  );
}
