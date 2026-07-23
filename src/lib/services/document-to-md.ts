/**
 * Document to Markdown Converter
 * ================================
 * Converts raw document text to a condensed Markdown summary
 * BEFORE sending to AI. This drastically reduces token usage.
 *
 * Input: Raw text (potentially 50+ pages)
 * Output: Condensed MD (max ~2000 words / ~3000 tokens)
 */

const MAX_OUTPUT_CHARS = 8000; // ~2000 words, ~3000 tokens

// Patterns that indicate important content to keep
const IMPORTANT_PATTERNS = [
  /objetivos?\s*(estrat[eé]gicos?)?/i,
  /misi[oó]n/i,
  /visi[oó]n/i,
  /kpi/i,
  /indicador/i,
  /meta\b/i,
  /f[oó]rmula/i,
  /perspectiva/i,
  /potenciar|consolidar|establecer|fortalecer|incrementar|mejorar|reducir|disminuir/i,
  /nomenclatura/i,
  /plan\s*(estrat[eé]gico|operativo)/i,
  /foda|dofa|fortaleza|oportunidad|debilidad|amenaza/i,
  /eje\s*estrat[eé]gico/i,
  /acci[oó]n|actividad/i,
  /resultado\s*clave/i,
  /dimensi[oó]n/i,
  /captaci[oó]n|retenci[oó]n/i,
];

// Patterns for content to SKIP (reduce noise)
const SKIP_PATTERNS = [
  /^(id|fecha|hora)\s/i,
  /^\d+\s+\d+\/\d+\/\d+/,  // Data rows (tables with dates)
  /lorem ipsum/i,
  /^[\d\s.,:;]+$/,  // Only numbers and punctuation
];

export function documentToMarkdown(rawText: string, documentName: string): string {
  const lines = rawText.split("\n");
  const sections: string[] = [];
  let currentSection = "";
  let currentSectionImportant = false;

  sections.push(`# Resumen: ${documentName}\n`);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty or noise lines
    if (!trimmed || trimmed.length < 5) continue;
    if (SKIP_PATTERNS.some((p) => p.test(trimmed))) continue;

    // Check if this line is a section header (numbered or all caps)
    const isHeader = /^\d+[\.\)]\s+[A-ZÁÉÍÓÚ]/.test(trimmed) ||
                     /^[A-ZÁÉÍÓÚ\s]{10,}$/.test(trimmed) ||
                     /^#{1,3}\s/.test(trimmed) ||
                     /^[a-z][\.\)]\s+/i.test(trimmed);

    // Check if line contains important content
    const isImportant = IMPORTANT_PATTERNS.some((p) => p.test(trimmed));

    if (isHeader) {
      // Save previous section if important
      if (currentSection && currentSectionImportant) {
        sections.push(currentSection);
      }
      // Start new section
      const headerText = trimmed.replace(/^\d+[\.\)]\s*/, "").replace(/^#+\s*/, "");
      currentSection = `\n## ${headerText}\n`;
      currentSectionImportant = isImportant;
    } else if (isImportant || currentSectionImportant) {
      // Keep important lines
      if (trimmed.startsWith("·") || trimmed.startsWith("•") || trimmed.startsWith("-")) {
        currentSection += `- ${trimmed.replace(/^[·•\-]\s*/, "")}\n`;
      } else if (/^nomenclatura/i.test(trimmed)) {
        currentSection += `\n**${trimmed}**\n`;
      } else if (/^(nombre|objetivo|f[oó]rmula|condici[oó]n)/i.test(trimmed)) {
        currentSection += `- ${trimmed}\n`;
      } else {
        currentSection += `${trimmed}\n`;
      }
      currentSectionImportant = true;
    }
  }

  // Don't forget last section
  if (currentSection && currentSectionImportant) {
    sections.push(currentSection);
  }

  let result = sections.join("\n");

  // Truncate if still too long
  if (result.length > MAX_OUTPUT_CHARS) {
    result = result.substring(0, MAX_OUTPUT_CHARS);
    // Cut at last complete line
    const lastNewline = result.lastIndexOf("\n");
    if (lastNewline > MAX_OUTPUT_CHARS * 0.8) {
      result = result.substring(0, lastNewline);
    }
    result += "\n\n[... documento truncado para optimizar tokens ...]\n";
  }

  return result;
}

/**
 * Get token estimate for a text
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token for Spanish
  return Math.ceil(text.length / 4);
}

/**
 * Prepare document text for AI consumption
 * Returns condensed markdown + token estimate
 */
export function prepareForAI(rawText: string, documentName: string): {
  markdown: string;
  estimatedTokens: number;
  originalLength: number;
  reducedLength: number;
  reductionPercent: number;
} {
  const markdown = documentToMarkdown(rawText, documentName);
  const estimatedTokens = estimateTokens(markdown);

  return {
    markdown,
    estimatedTokens,
    originalLength: rawText.length,
    reducedLength: markdown.length,
    reductionPercent: Math.round((1 - markdown.length / rawText.length) * 100),
  };
}
