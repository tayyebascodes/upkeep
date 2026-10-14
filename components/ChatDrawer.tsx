"use client";

import { useState } from "react";
import { Send, Bot, User, Sparkles, AlertTriangle, CheckCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
      id: "1",
      sender: "bot",
      text: `Hi! I'm your maintenance assistant for ${propertyName}. What seems to be the issue in your unit?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasEmergency, setHasEmergency] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput("");

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    // Emergency Detection Filter
    const lower = userText.toLowerCase();
    const isEmergency =
      lower.includes("gas") ||
      lower.includes("smoke") ||
      lower.includes("fire") ||
      lower.includes("spark") ||
      lower.includes("flooding") ||
      lower.includes("burst pipe");

    if (isEmergency) {
      setHasEmergency(true);
    }

    setTimeout(async () => {
      let botResponse = "";

      if (isEmergency) {
        botResponse =
          "🚨 CRITICAL EMERGENCY DETECTED: If you smell natural gas, see flames, or have high electrical sparks, please EVACUATE the building immediately and call 911! I am alerting property emergency dispatch now.";
      } else if (lower.includes("outlet") || lower.includes("power") || lower.includes("electricity")) {
        botResponse =
          "I can help with that! In bathroom and kitchen areas, outlets often trip their safety breakers. Have you tried pressing the center 'RESET' button on the outlet? If that doesn't work, I'll log a ticket for our electrician.";
      } else if (lower.includes("leak") || lower.includes("water") || lower.includes("faucet") || lower.includes("toilet")) {
        botResponse =
          "Got it. Is the water actively gushing or just a slow drip? If there is a shutoff valve underneath, turn it clockwise to prevent damage. I am logging a Plumbing ticket for your unit right now.";
      } else if (lower.includes("ac") || lower.includes("heat") || lower.includes("cold") || lower.includes("warm")) {
        botResponse =
          "Thanks for letting me know. Is the thermostat screen showing power, and is the fan blowing at all? I'm drafting an HVAC maintenance request for you.";
      } else {
        botResponse =
          "Thank you for reporting this. I've noted down the details and created an official maintenance ticket for your property management team.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      // Save ticket to Supabase
      if (supabase) {
        try {
          const category = lower.includes("leak") || lower.includes("sink") || lower.includes("pipe")
            ? "Plumbing"
            : lower.includes("outlet") || lower.includes("light")
            ? "Electrical"
            : lower.includes("ac") || lower.includes("heat")
            ? "HVAC"
            : "Other";

          await supabase.from("tickets").insert([
            {
              property_id: propertyId,
              unit_number: unitNumber,
              title: userText.slice(0, 40),
              description: userText,
              category: category,
              severity: isEmergency ? "Emergency" : "Medium",
              status: "Pending",
              source: "chat",
            },
          ]);
          if (onTicketCreated) onTicketCreated();
        } catch (err) {
          console.error("Supabase ticket save error:", err);
        }
      }
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative flex h-[580px] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Maintenance Triage Chat</h3>
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

        {/* Emergency Alert Banner */}
        {hasEmergency && (
          <div className="flex items-center gap-2 bg-rose-500 px-4 py-2 text-xs font-semibold text-white">
            <AlertTriangle className="h-4 w-4 animate-bounce" />
            <span>Emergency detected: Call 911 for life safety. Dispatch notified.</span>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs mb-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                    : "bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-200/80"
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`mt-1 block text-[10px] ${
                    m.sender === "user" ? "text-blue-200 text-right" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="h-4 w-4 text-blue-500 animate-pulse" />
              <span>Agent is typing...</span>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="border-t border-slate-100 p-3 bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what's broken (e.g. leaking sink)..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
