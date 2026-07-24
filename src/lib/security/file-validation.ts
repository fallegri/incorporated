/**
 * File validation using magic bytes (file signatures).
 * Prevents uploading disguised malicious files.
 */

interface FileSignature {
  bytes: number[];
  offset: number;
}

const FILE_SIGNATURES: Record<string, FileSignature[]> = {
  pdf: [{ bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }], // %PDF
  docx: [{ bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 }], // PK (ZIP-based)
  doc: [{ bytes: [0xd0, 0xcf, 0x11, 0xe0], offset: 0 }], // OLE2
  xlsx: [{ bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 }], // PK (ZIP-based)
  xls: [{ bytes: [0xd0, 0xcf, 0x11, 0xe0], offset: 0 }], // OLE2
};

/**
 * Validate file content matches its declared extension
 */
export function validateFileSignature(buffer: Buffer, declaredExtension: string): boolean {
  const ext = declaredExtension.toLowerCase();

  // Text files don't have magic bytes — check they're valid UTF-8
  if (ext === "txt" || ext === "md") {
    return isValidUTF8(buffer);
  }

  const signatures = FILE_SIGNATURES[ext];
  if (!signatures) return true; // Unknown extension, allow (will fail on parse anyway)

  return signatures.some((sig) => {
    if (buffer.length < sig.offset + sig.bytes.length) return false;
    return sig.bytes.every((byte, i) => buffer[sig.offset + i] === byte);
  });
}

function isValidUTF8(buffer: Buffer): boolean {
  try {
    const text = buffer.toString("utf-8");
    // Check for binary content (null bytes in first 1000 chars)
    return !text.slice(0, 1000).includes("\x00");
  } catch {
    return false;
  }
}

/**
 * Check file size limits by type
 */
export function validateFileSize(size: number, ext: string): { valid: boolean; maxMB: number } {
  const limits: Record<string, number> = {
    pdf: 20,
    docx: 20,
    doc: 20,
    xlsx: 10,
    xls: 10,
    txt: 5,
    md: 5,
  };
  const maxMB = limits[ext.toLowerCase()] || 20;
  return { valid: size <= maxMB * 1024 * 1024, maxMB };
}
