import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  extractGlossaryFromText,
  mergeGlossaryTerms,
} from "@/lib/services/glossary-extractor";

/**
 * GET /api/glosario — Extract institutional glossary terms from documents
 * Scans document rawText for acronyms and defined terms (no AI required)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    // Get all documents with rawText for the user's organization
    const whereClause: any = {};
    if (user.organizationId) {
      whereClause.organizationId = user.organizationId;
    } else {
      whereClause.uploadedById = user.id;
    }

    const documents = await prisma.document.findMany({
      where: {
        ...whereClause,
        rawText: { not: null },
        status: "READY",
      },
      select: {
        id: true,
        name: true,
        rawText: true,
        type: true,
      },
    });

    // Extract terms from each document
    const allTerms = documents.flatMap((doc) => {
      if (!doc.rawText) return [];
      return extractGlossaryFromText(doc.rawText, doc.name, doc.id);
    });

    // Merge and deduplicate
    const glossary = mergeGlossaryTerms(allTerms);

    return NextResponse.json({
      total: glossary.length,
      documentsScanned: documents.length,
      terms: glossary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al generar glosario: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
