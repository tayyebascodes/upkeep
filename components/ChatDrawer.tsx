"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertTriangle, CheckCircle, X, Wrench, ShieldCheck, Clock } from "lucide-react";
import { Ticket } from "@/lib/types";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  propertyId: string;
  unitNumber?: string;
  onTicketCreated?: () => void;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  ticketBadge?: Ticket;
}

export function ChatDrawer({
  isOpen,
  onClose,
  propertyName,
  propertyId,
  unitNumber = "Unit 304",
  onTicketCreated,
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: `Hello! I'm Upkeep, the 24/7 AI maintenance assistant for ${propertyName}. What seems to be the issue in ${unitNumber}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [triageStage, setTriageStage] = useState<"diagnosing" | "troubleshooting" | "dispatched">("diagnosing");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput("");

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Call our Multi-Turn Autonomous AI Triage endpoint
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          propertyName,
          unitNumber,
          propertyId,
        }),
      });

      const data = await res.json();

      let createdTicket = data.createdTicket;
      if (createdTicket) {
        setTriageStage("dispatched");
        if (onTicketCreated) onTicketCreated();
      } else {
        setTriageStage("troubleshooting");
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "Could you provide a few more details so I can narrow this down accurately?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ticketBadge: createdTicket,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat triage error:", err);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: "I want to make sure this is addressed properly. Is the issue actively leaking, making loud noises, or posing an electrical hazard?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative flex h-[620px] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        
        {/* Header with Live Diagnostic Indicator */}
        <div className="border-b border-slate-100 bg-slate-50/90 px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900">Upkeep AI Triage Agent</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-500">{propertyName} • {unitNumber}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Real-time Triage Status Bar */}
          <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Triage Stage:</span>
            {triageStage === "diagnosing" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                <Sparkles className="h-3 w-3 text-blue-600" /> Investigating & Narrowing Down Issue
              </span>
            )}
            {triageStage === "troubleshooting" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Wrench className="h-3 w-3 text-amber-600" /> Guided Self-Resolution & Safety Check
              </span>
            )}
            {triageStage === "dispatched" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle className="h-3 w-3 text-emerald-600" /> Maintenance Ticket Dispatched
              </span>
            )}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs mb-1 flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              
              <div className="flex flex-col gap-1.5 max-w-[82%]">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 rounded-bl-none border border-slate-200/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`mt-1 block text-[10px] ${
                      m.sender === "user" ? "text-blue-200 text-right" : "text-slate-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {/* Inline Ticket Confirmation Card */}
                {m.ticketBadge && (
                  <div className="rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>Work Order Created</span>
                      </div>
                      <span className="rounded-full bg-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {m.ticketBadge.severity}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{m.ticketBadge.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Category: {m.ticketBadge.category} • Assigned to Property Maintenance Team
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium mt-1">
                      Track live progress in your "My Requests" tab.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-xl w-fit border border-slate-200/70 shadow-sm">
              <Bot className="h-4 w-4 text-blue-600 animate-spin" />
              <span>Upkeep is analyzing diagnostic steps...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="border-t border-slate-100 p-3 bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response to narrow down the issue..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
