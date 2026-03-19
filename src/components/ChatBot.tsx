import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are CrunchBot, a friendly and helpful AI assistant for CrunchCraft Express — a fast food / snack restaurant. You help customers with:
- Menu questions (ingredients, allergens, dietary options, combos, specials)
- Order assistance (what to order, recommendations, customizations)
- Cart & checkout help (how to place orders, payment questions, delivery info)
- General customer support (hours, locations, complaints, feedback)

Keep responses concise, warm, and food-focused. Use food emojis occasionally to keep it fun. If you don't know a specific detail (like exact prices or today's specials), politely say so and suggest the customer check the menu or contact staff.`;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey there! 👋 I'm CrunchBot, your CrunchCraft assistant. Ask me anything about our menu, your order, or anything else I can help with! 🍔",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const reply =
        data?.content?.[0]?.text ?? "Sorry, I couldn't get a response. Please try again!";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong 😅 Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .crunchbot-wrap * { box-sizing: border-box; }

        .crunchbot-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B2B 0%, #FF3D00 100%);
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(255, 61, 0, 0.45), 0 2px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
          outline: none;
        }
        .crunchbot-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(255, 61, 0, 0.55), 0 4px 12px rgba(0,0,0,0.25);
        }
        .crunchbot-fab:active { transform: scale(0.96); }

        .crunchbot-fab svg { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); }
        .crunchbot-fab.open svg { transform: rotate(45deg); }

        .crunchbot-badge {
          position: absolute;
          top: -2px; right: -2px;
          width: 14px; height: 14px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse-badge 2s infinite;
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        .crunchbot-panel {
          position: fixed;
          bottom: 102px;
          right: 28px;
          z-index: 9998;
          width: 370px;
          max-width: calc(100vw - 40px);
          background: #0f0e0d;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,107,43,0.15);
          display: flex;
          flex-direction: column;
          transform-origin: bottom right;
          animation: panel-in 0.35s cubic-bezier(.34,1.56,.64,1) forwards;
          max-height: 540px;
        }
        @keyframes panel-in {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .crunchbot-panel.closing {
          animation: panel-out 0.2s ease-in forwards;
        }
        @keyframes panel-out {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.8) translateY(10px); }
        }

        .crunchbot-header {
          background: linear-gradient(135deg, #FF6B2B 0%, hsl(var(--primary)));
          padding: 18px 20px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .crunchbot-avatar {
          width: 42px; height: 42px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.35);
        }
        .crunchbot-header-text { flex: 1; }
        .crunchbot-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 16px;
          color: white;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .crunchbot-status {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.8);
          display: flex; align-items: center; gap: 5px;
        }
        .crunchbot-dot {
          width: 7px; height: 7px;
          background: #86efac;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .crunchbot-close {
          background: rgba(255,255,255,0.15);
          border: none;
          border-radius: 50%;
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: white;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .crunchbot-close:hover { background: rgba(255,255,255,0.28); }

        .crunchbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: #2a2825 transparent;
        }
        .crunchbot-messages::-webkit-scrollbar { width: 4px; }
        .crunchbot-messages::-webkit-scrollbar-thumb { background: #2a2825; border-radius: 4px; }

        .crunchbot-msg {
          display: flex;
          gap: 8px;
          animation: msg-in 0.25s cubic-bezier(.34,1.56,.64,1) forwards;
        }
        @keyframes msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .crunchbot-msg.user { flex-direction: row-reverse; }

        .crunchbot-bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }
        .crunchbot-msg.assistant .crunchbot-bubble {
          background: #1e1c1a;
          color: #e8e2da;
          border-radius: 4px 18px 18px 18px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .crunchbot-msg.user .crunchbot-bubble {
          background: linear-gradient(135deg, #FF6B2B, #FF3D00);
          color: white;
          border-radius: 18px 4px 18px 18px;
        }

        .crunchbot-msg-icon {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .crunchbot-msg.assistant .crunchbot-msg-icon {
          background: #1e1c1a;
          border: 1px solid rgba(255,107,43,0.3);
        }
        .crunchbot-msg.user .crunchbot-msg-icon {
          background: rgba(255,107,43,0.15);
        }

        .crunchbot-typing {
          display: flex; align-items: center; gap: 4px;
          padding: 12px 14px;
          background: #1e1c1a;
          border-radius: 4px 18px 18px 18px;
          width: fit-content;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .crunchbot-typing span {
          width: 6px; height: 6px;
          background: #FF6B2B;
          border-radius: 50%;
          animation: typing-dot 1.2s infinite;
        }
        .crunchbot-typing span:nth-child(2) { animation-delay: 0.2s; }
        .crunchbot-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        .crunchbot-footer {
          padding: 12px 14px 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
          background: #0f0e0d;
        }
        .crunchbot-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1e1c1a;
          border-radius: 14px;
          padding: 6px 6px 6px 14px;
          border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.2s;
        }
        .crunchbot-input-row:focus-within {
          border-color: rgba(255,107,43,0.5);
          box-shadow: 0 0 0 3px rgba(255,107,43,0.08);
        }
        .crunchbot-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #e8e2da;
          caret-color: #FF6B2B;
        }
        .crunchbot-input::placeholder { color: #5a5550; }
        .crunchbot-send {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #FF6B2B, #FF3D00);
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s, opacity 0.15s;
        }
        .crunchbot-send:hover:not(:disabled) { transform: scale(1.07); }
        .crunchbot-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .crunchbot-hint {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #3a3530;
          text-align: center;
          margin-top: 8px;
        }
      `}</style>

      <div className="crunchbot-wrap">
        {/* Floating Button */}
        <button
          className={`crunchbot-fab ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close chat" : "Open CrunchBot chat"}
        >
          {!open && <div className="crunchbot-badge" />}
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
            </svg>
          )}
        </button>

        {/* Chat Panel */}
        {open && (
          <div className="crunchbot-panel">
            {/* Header */}
            <div className="crunchbot-header">
              <div className="crunchbot-avatar">🤖</div>
              <div className="crunchbot-header-text">
                <div className="crunchbot-name">CrunchBot</div>
                <div className="crunchbot-status">
                  <div className="crunchbot-dot" />
                  Online · Here to help
                </div>
              </div>
              <button className="crunchbot-close" onClick={() => setOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="crunchbot-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`crunchbot-msg ${msg.role}`}>
                  <div className="crunchbot-msg-icon">
                    {msg.role === "assistant" ? "🤖" : "👤"}
                  </div>
                  <div className="crunchbot-bubble">{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="crunchbot-msg assistant">
                  <div className="crunchbot-msg-icon">🤖</div>
                  <div className="crunchbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="crunchbot-footer">
              <div className="crunchbot-input-row">
                <input
                  ref={inputRef}
                  className="crunchbot-input"
                  placeholder="Ask about menu, orders, help…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                />
                <button
                  className="crunchbot-send"
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="crunchbot-hint">Powered by Claude AI · Press Enter to send</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
