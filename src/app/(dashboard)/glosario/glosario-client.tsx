"use client";

import { useState } from "react";

interface GlossaryTerm {
  term: string;
  definition: string;
  source: string;
  sourceId: string;
  type: "acronym" | "term";
}

interface GlosarioClientProps {
  terms: GlossaryTerm[];
}

export function GlosarioClient({ terms }: GlosarioClientProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "acronym" | "term">("all");

  const filteredTerms = terms.filter((t) => {
    const matchesSearch =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  if (terms.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-gray-900">
          Sin terminos detectados
        </h3>
        <p className="text-gray-500 mt-2">
          Sube documentos institucionales (PEI, FODA, MOF, POI) a la biblioteca
          para que el sistema extraiga automaticamente siglas y definiciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar termino o definicion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filterType === "all"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos ({terms.length})
            </button>
            <button
              onClick={() => setFilterType("acronym")}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filterType === "acronym"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Siglas ({terms.filter((t) => t.type === "acronym").length})
            </button>
            <button
              onClick={() => setFilterType("term")}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filterType === "term"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Terminos ({terms.filter((t) => t.type === "term").length})
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-gray-500 px-1">
          {filteredTerms.length} resultado(s) para &quot;{search}&quot;
        </p>
      )}

      {/* Terms list */}
      <div className="bg-white rounded-lg shadow-sm border divide-y divide-gray-100">
        {filteredTerms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron terminos con ese criterio de busqueda.
          </div>
        ) : (
          filteredTerms.map((term, idx) => (
            <div key={`${term.term}-${idx}`} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold mt-0.5 ${
                    term.type === "acronym"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {term.type === "acronym" ? "SIGLA" : "TERM"}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">
                    {term.term}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {term.definition}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Fuente: {term.source}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
