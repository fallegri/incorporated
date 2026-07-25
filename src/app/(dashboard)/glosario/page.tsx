import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  extractGlossaryFromText,
  mergeGlossaryTerms,
} from "@/lib/services/glossary-extractor";
import { GlosarioClient } from "./glosario-client";

export default async function GlosarioPage() {
  const session = await auth();
  const user = session?.user as any;

  let glossary: any[] = [];
  let docsScanned = 0;

  if (user?.id) {
    try {
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
        },
      });

      docsScanned = documents.length;

      const allTerms = documents.flatMap((doc) => {
        if (!doc.rawText) return [];
        return extractGlossaryFromText(doc.rawText, doc.name, doc.id);
      });

      glossary = mergeGlossaryTerms(allTerms);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          📖 Glosario Institucional
        </h1>
        <p className="text-gray-600 mt-1">
          Diccionario de terminos, siglas y acronimos extraidos automaticamente
          de los documentos institucionales.
        </p>
        <div className="flex gap-4 mt-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {glossary.length} terminos encontrados
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {docsScanned} documentos escaneados
          </span>
        </div>
      </div>

      <GlosarioClient terms={glossary} />
    </div>
  );
}
