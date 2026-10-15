"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, AlertTriangle, CheckCircle2, X, Search, Wrench, Sparkles } from "lucide-react";
import { Ticket, Property } from "@/lib/types";
import { getAgentPersona } from "@/lib/agent-config";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  unitNumber: string;
  onTicketCreated?: () => void;
  property?: Partial<Property> | null;
  propertyId?: string;
  tenantId?: string;
  tenantName?: string;
  tenantPhone?: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  ticketBadge?: Ticket;
}

type TriageStage = "diagnosing" | "troubleshooting" | "dispatched";

const STAGES: Record<TriageStage, { label: string; icon: typeof Search; style: string }> = {
  diagnosing: { label: "Diagnosing", icon: Search, style: "bg-brand-50 text-brand-700" },
  troubleshooting: { label: "Troubleshooting", icon: Wrench, style: "bg-brand-100 text-brand-800" },
  dispatched: { label: "Ticket filed", icon: CheckCircle2, style: "bg-brand-600 text-white" },
};

// Instant client-side safety banner; the agent also handles emergencies in its reply.
function checkEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  // Don't trigger emergency for routine smoke detector / alarm inquiries
  if (
    (lower.includes("smoke detector") || lower.includes("smoke alarm") || lower.includes("detect smoke")) &&
    !lower.includes("heavy smoke") &&
    !lower.includes("black smoke") &&
    !lower.includes("smoke coming") &&
    !lower.includes("room is full of smoke")
  ) {
    return false;
  }

  const EMERGENCY_WORDS = ["gas leak", "smell gas", "on fire", "sparks", "flooding", "burst pipe", "ceiling collapse"];
  return EMERGENCY_WORDS.some((w) => lower.includes(w));
}

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function ChatDrawer({
  isOpen,
  onClose,
  propertyName,
  unitNumber,
  onTicketCreated,
  property,
  propertyId,
}: ChatDrawerProps) {
  const persona = useMemo(
    () => getAgentPersona(property || { name: propertyName }),
    [property, propertyName]
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasEmergency, setHasEmergency] = useState(false);
  const [triageStage, setTriageStage] = useState<TriageStage>("diagnosing");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize personalized greeting whenever persona changes
  useEffect(() => {
    const greetingText = persona.greeting.replace("in your unit", `in ${unitNumber || "your unit"}`);
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: greetingText,
        timestamp: now(),
      },
    ]);
  }, [persona, unitNumber]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput("");

    if (checkEmergency(userText)) setHasEmergency(true);

    const userMsg: Message = { id: `user-${Date.now()}`, sender: "user", text: userText, timestamp: now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Multi-turn AI triage. The server files a ticket once the issue is diagnosed.
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: propertyId || property?.id,
          propertyName: propertyName || property?.name,
          unitNumber,
          agentVoice: property?.agent_voice,
          agentLanguage: property?.agent_language,
          agentTone: property?.agent_tone,
          messages: updatedMessages.map(({ sender, text }) => ({ sender, text })),
        }),
      });
      const data = await res.json();

      const createdTicket: Ticket | undefined = data.createdTicket ?? undefined;
      if (createdTicket) {
        setTriageStage("dispatched");
        onTicketCreated?.();
      } else if (triageStage !== "dispatched") {
        setTriageStage("troubleshooting");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.reply || "Could you share a few more details so I can narrow this down?",
          timestamp: now(),
          ticketBadge: createdTicket,
        },
      ]);
    } catch (err) {
      console.error("Chat triage error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "Is it actively leaking, making loud noises, or an electrical hazard?",
          timestamp: now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  const stage = STAGES[triageStage];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift animate-pop-in sm:h-[620px] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white font-semibold text-xs">
              {persona.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-ink">{persona.name}</h3>
                <span className="text-[11px] text-ink-muted">· Maintenance</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={`badge px-2 py-0 text-[11px] ${stage.style}`}>
                  <stage.icon className="h-3 w-3" />
                  {stage.label}
                </span>
                <span className="badge bg-surface text-ink-muted px-1.5 py-0 text-[10px]">
                  {persona.toneName}
                </span>
                {persona.language !== "English" && (
                  <span className="badge bg-brand-50 text-brand-700 px-1.5 py-0 text-[10px]">
                    {persona.language}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon h-8 w-8" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Emergency Alert Banner */}
        {hasEmergency && (
          <div className="flex items-center gap-2 bg-red-600 px-5 py-2.5 text-xs font-medium text-white">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              Emergency: call 911
              {persona.emergencyContact ? `, then property emergency at ${persona.emergencyContact}` : ""}. Dispatch notified.
            </span>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-surface/60 p-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-2 ${m.sender === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "rounded-br-md bg-brand-600 text-white"
                    : "rounded-bl-md border border-line bg-white"
                }`}
              >
                {m.sender === "bot" && (
                  <span className="mb-1 block text-[10px] font-semibold text-brand-700">
                    {persona.name}
                  </span>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span
                  className={`mt-1 block text-[10px] ${
                    m.sender === "user" ? "text-right text-brand-200" : "text-ink-subtle"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {/* Inline ticket confirmation */}
              {m.ticketBadge && (
                <div className="w-[80%] rounded-2xl border border-brand-200 bg-brand-50 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-brand-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" /> Ticket filed
                    </span>
                    <span className="badge bg-white px-2 py-0 text-[11px] text-brand-700">
                      {m.ticketBadge.severity}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium">{m.ticketBadge.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {m.ticketBadge.category} · Track it in My requests
                  </p>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex w-fit gap-1 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's broken?"
            className="input rounded-full"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="btn btn-primary btn-icon flex-shrink-0"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
