"use client";

import { useState } from "react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FAQData {
  total: number;
  categories: string[];
  faqs: FAQItem[];
}

interface FAQClientProps {
  data: FAQData | null;
}

const categoryIcons: Record<string, string> = {
  "Primeros pasos": "🚀",
  "Objetivos y Metas": "🎯",
  "KPIs e Indicadores": "📊",
  "Documentos": "📄",
  "Plazos y Ritmos": "⏰",
  "Uso del Sistema": "💻",
};

export function FAQClient({ data }: FAQClientProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!data || data.faqs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">❓</div>
        <h3 className="text-lg font-medium text-gray-900">
          FAQ no disponible
        </h3>
        <p className="text-gray-500 mt-2">
          Las preguntas frecuentes se generan automaticamente cuando tienes
          objetivos, actividades y documentos en el sistema.
        </p>
      </div>
    );
  }

  const filteredFaqs =
    selectedCategory === "all"
      ? data.faqs
      : data.faqs.filter((f) => f.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFaqs.map((f) => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas ({data.total})
          </button>
          {data.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {categoryIcons[cat] || "📌"} {cat} (
              {data.faqs.filter((f) => f.category === cat).length})
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={expandAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Expandir todas
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Colapsar todas
          </button>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-lg shadow-sm border divide-y divide-gray-100">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedIds.has(faq.id);
          return (
            <div key={faq.id}>
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg mt-0.5 shrink-0">
                  {isExpanded ? "▼" : "▶"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {categoryIcons[faq.category] || "📌"} {faq.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mt-1">
                    {faq.question}
                  </h3>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 ml-9">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
