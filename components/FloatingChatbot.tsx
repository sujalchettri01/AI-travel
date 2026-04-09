"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi 👋 Ask me anything about travel!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      const data = await res.json();

      const reply =
        data?.reply && typeof data.reply === "string"
          ? data.reply
          : "Sorry, I couldn’t understand that properly.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-2xl transition hover:scale-105"
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[360px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-neutral-900 px-4 py-4">
            <div>
              <h2 className="text-sm font-semibold">Travel AI</h2>
              <p className="text-xs text-neutral-400">
                Ask about places, food, budgets, culture
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-neutral-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-neutral-950 px-3 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto bg-white text-black"
                      : "mr-auto bg-neutral-800 text-neutral-100"
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {loading && (
                <div className="mr-auto max-w-[85%] rounded-2xl bg-neutral-800 px-4 py-3 text-sm text-neutral-300">
                  Typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-white/10 bg-neutral-900 p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-950 p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your trip..."
                className="flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-neutral-500"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}