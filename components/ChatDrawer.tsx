"use client";

import { useState } from "react";
import { Send, Bot, AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  propertyId: string;
  unitNumber: string;
  tenantId: string;
  tenantName?: string;
  tenantPhone?: string;
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
  unitNumber,
  tenantId,
  tenantName,
  tenantPhone,
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

      // Save ticket to Supabase (RLS: tenant_id must be the signed-in tenant)
      const category = lower.includes("leak") || lower.includes("sink") || lower.includes("pipe")
        ? "Plumbing"
        : lower.includes("outlet") || lower.includes("light")
        ? "Electrical"
        : lower.includes("ac") || lower.includes("heat")
        ? "HVAC"
        : "Other";

      const { error } = await createClient().from("tickets").insert([
        {
          property_id: propertyId,
          tenant_id: tenantId,
          tenant_name: tenantName,
          tenant_phone: tenantPhone,
          unit_number: unitNumber,
          title: userText.slice(0, 40),
          description: userText,
          category: category,
          severity: isEmergency ? "Emergency" : "Medium",
          status: "Pending",
          source: "chat",
        },
      ]);
      if (error) console.error("Supabase ticket save error:", error);
      else if (onTicketCreated) onTicketCreated();
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift animate-pop-in sm:h-[600px] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
              <Bot className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Maintenance</h3>
              <p className="text-xs text-ink-subtle">{unitNumber}</p>
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
            <span>Emergency: call 911. Dispatch notified.</span>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-surface/60 p-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "rounded-br-md bg-brand-600 text-white"
                    : "rounded-bl-md border border-line bg-white"
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`mt-1 block text-[10px] ${
                    m.sender === "user" ? "text-right text-brand-200" : "text-ink-subtle"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-fit gap-1 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          )}
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
          <button type="submit" disabled={!input.trim()} className="btn btn-primary btn-icon flex-shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
