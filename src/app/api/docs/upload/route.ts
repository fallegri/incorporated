import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import mammoth from "mammoth";

// Dynamic import to avoid pdf-parse test file issue at build time
async function parsePDF(buffer: Buffer): Promise<string> {
  const pdf = (await import("pdf-parse")).default;
  const data = await pdf(buffer);
  return data.text;
}

/**
 * POST /api/docs/upload
 * Receives a file (PDF, DOCX, TXT, MD), converts to text, saves to DB.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;
  if (!user.organizationId) {
    return NextResponse.json({ error: "Sin organización" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = (formData.get("type") as string) || "OTRO";

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    // Validate size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo excede 20MB" }, { status: 400 });
    }

    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert file to text based on format
    let textContent = "";
    let format = "TEXT";

    switch (ext) {
      case "pdf":
        format = "PDF";
        return NextResponse.json(
          { error: "PDF temporalmente no soportado en este servidor. Por favor convierte tu PDF a Word (.docx) o copia el texto y usa la opción 'Pegar texto'." },
          { status: 400 }
        );
        break;

      case "docx":
      case "doc":
        format = ext.toUpperCase();
        try {
          const result = await mammoth.extractRawText({ buffer });
          textContent = result.value;
        } catch {
          return NextResponse.json(
            { error: "No se pudo leer el archivo Word." },
            { status: 400 }
          );
        }
        break;

      case "txt":
      case "md":
        format = ext.toUpperCase();
        textContent = buffer.toString("utf-8");
        break;

      case "xlsx":
      case "xls":
        format = ext.toUpperCase();
        // Basic: read as text (won't parse structured data perfectly)
        textContent = buffer.toString("utf-8");
        if (textContent.includes("\x00") || textContent.length < 10) {
          return NextResponse.json(
            { error: "Para archivos Excel, copia el contenido como texto y usa la opción 'Pegar texto'." },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: `Formato .${ext} no soportado. Usa PDF, Word, TXT o MD.` },
          { status: 400 }
        );
    }

    if (!textContent || textContent.trim().length < 10) {
      return NextResponse.json(
        { error: "No se pudo extraer texto del archivo. Verifica que contenga texto legible." },
        { status: 400 }
      );
    }

    // Save to database
    const document = await prisma.document.create({
      data: {
        name: fileName,
        type: docType as any,
        format: format as any,
        rawText: textContent.trim(),
        status: "READY",
        organizationId: user.organizationId,
        uploadedById: user.id,
      },
    });

    return NextResponse.json({
      id: document.id,
      name: document.name,
      type: document.type,
      format,
      contentLength: textContent.length,
      message: `Documento procesado: ${(textContent.length / 1024).toFixed(1)} KB de texto extraído`,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error al procesar archivo: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
