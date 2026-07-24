/**
 * Input Sanitization & Prompt Injection Protection
 */

/**
 * Sanitize user input for general text fields
 * Removes potential XSS and injection patterns
 */
export function sanitizeText(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== "string") return "";
  
  return input
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:text\/html/gi, "") // Remove data: HTML
    .trim();
}

/**
 * Sanitize filename — prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\]/g, "_") // Replace path separators
    .replace(/\.\./g, "_") // Prevent directory traversal
    .replace(/[^\w\s\-_.]/g, "") // Only allow safe characters
    .slice(0, 255); // Max filename length
}

/**
 * Sanitize prompt for AI — prevent prompt injection
 * Wraps user content in delimiters that the AI is instructed to treat as data, not instructions
 */
export function sanitizeForAI(userInput: string): string {
  // Remove common injection patterns
  const cleaned = userInput
    .replace(/ignore\s+(all\s+)?previous\s+instructions?/gi, "[filtered]")
    .replace(/you\s+are\s+now\s+/gi, "[filtered]")
    .replace(/system\s*:\s*/gi, "[filtered]")
    .replace(/\[INST\]/gi, "[filtered]")
    .replace(/<\|im_start\|>/gi, "[filtered]")
    .replace(/```system/gi, "```text");

  return cleaned;
}

/**
 * Validate that document type is a valid enum value
 */
export function validateDocType(type: string): string {
  const valid = ["PEI", "FODA", "MOF", "POI", "OTRO"];
  return valid.includes(type) ? type : "OTRO";
}

/**
 * Validate that format is a valid enum value
 */
export function validateDocFormat(format: string): string {
  const valid = ["PDF", "DOCX", "DOC", "XLSX", "XLS", "TXT", "MD", "TEXT"];
  return valid.includes(format) ? format : "TEXT";
}
