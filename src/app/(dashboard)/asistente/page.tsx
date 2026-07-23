"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || data.error || "Sin respuesta" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión con el asistente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-900">💬 Asistente IA</h1>
        <p className="text-sm text-gray-600">
          Pregunta sobre tu cargo, funciones, objetivos o documentos de la organización.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm border p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-4xl mb-3">🤖</p>
            <p>Haz una pregunta para comenzar</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-500">Ejemplos:</p>
              <button onClick={() => setInput("¿Cuáles son mis principales funciones?")} className="block mx-auto text-blue-600 hover:underline">
                "¿Cuáles son mis principales funciones?"
              </button>
              <button onClick={() => setInput("¿Qué dice el PEI sobre mi área?")} className="block mx-auto text-blue-600 hover:underline">
                "¿Qué dice el PEI sobre mi área?"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-500">
              Pensando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escribe tu pregunta..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
