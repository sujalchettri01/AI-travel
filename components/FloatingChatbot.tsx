"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Hi 👋 Ask me anything about travel. I can help with destinations, food, budget, itinerary ideas, and travel tips.",
    },
  ]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get chatbot response");
      }

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 font-semibold text-black shadow-2xl"
        >
          Travel AI
        </button>
      ) : null}

      {open ? (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[360px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#07111f] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-4">
            <div>
              <h3 className="font-semibold text-white">Travel Chatbot</h3>
              <p className="text-xs text-white/60">Free travel assistance</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/10 px-3 py-1 text-sm text-white"
            >
              Close
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-cyan-400 text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                {message.text}
              </div>
            ))}

            {loading ? (
              <div className="max-w-[85%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 bg-white/5 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about any travel destination..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-2xl border border-white/10 bg-[#0d1b2f] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-black disabled:opacity-70"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}