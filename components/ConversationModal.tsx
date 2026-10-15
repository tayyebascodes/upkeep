"use client";

import { useMemo } from "react";
import { 
  X, 
  MessageSquare, 
  PhoneCall, 
  Building2, 
  User, 
  Clock, 
  Trash2, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Phone
} from "lucide-react";
import { StatusBadge, SeverityBadge } from "@/components/StatusBadge";
import { Select, type SelectOption } from "@/components/Select";
import type { Ticket, TicketStatus } from "@/lib/types";

interface ConversationModalProps {
  ticket: (Ticket & { properties?: { name: string } | null }) | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (ticketId: string, newStatus: TicketStatus) => void;
  onDeleteTicket?: (ticketId: string, title?: string) => void;
}

const STATUS_OPTIONS: SelectOption<TicketStatus>[] = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

const STATUS_SELECT: Record<TicketStatus, string> = {
  Pending: "bg-white text-ink-muted ring-line",
  "In Progress": "bg-brand-50 text-brand-700 ring-brand-200",
  Resolved: "bg-brand-600 text-white ring-brand-600",
};

interface ParsedMessage {
  id: string;
  speaker: "tenant" | "agent" | "system";
  text: string;
}

export function ConversationModal({
  ticket,
  isOpen,
  onClose,
  onUpdateStatus,
  onDeleteTicket,
}: ConversationModalProps) {
  // Parse description into structured dialogue or summary
  const { summary, messages } = useMemo(() => {
    if (!ticket?.description) {
      return { summary: "", messages: [] };
    }

    const raw = ticket.description.trim();
    let summaryText = "";
    let transcriptText = raw;

    // Check for delimiter "--- Full Conversation ---"
    if (raw.includes("--- Full Conversation ---")) {
      const parts = raw.split("--- Full Conversation ---");
      summaryText = parts[0].trim();
      transcriptText = parts[1].trim();
    }

    // Split transcript by lines or paragraphs
    const lines = transcriptText.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed: ParsedMessage[] = [];

    let currentSpeaker: "tenant" | "agent" | "system" = "system";
    let currentBuffer: string[] = [];

    const flushBuffer = () => {
      if (currentBuffer.length > 0) {
        parsed.push({
          id: `msg-${parsed.length}-${Date.now()}`,
          speaker: currentSpeaker,
          text: currentBuffer.join("\n"),
        });
        currentBuffer = [];
      }
    };

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith("tenant:") || lower.startsWith("user:")) {
        flushBuffer();
        currentSpeaker = "tenant";
        const content = line.replace(/^(tenant|user):\s*/i, "");
        if (content) currentBuffer.push(content);
      } else if (lower.startsWith("ai agent:") || lower.startsWith("agent:") || lower.startsWith("bot:")) {
        flushBuffer();
        currentSpeaker = "agent";
        const content = line.replace(/^(ai agent|agent|bot):\s*/i, "");
        if (content) currentBuffer.push(content);
      } else {
        // Continuation of previous speaker or general note
        if (currentBuffer.length === 0 && parsed.length === 0) {
          // If no prefix at all, set default speaker based on ticket source
          currentSpeaker = ticket.source === "voice_call" ? "agent" : "system";
        }
        currentBuffer.push(line);
      }
    }
    flushBuffer();

    return {
      summary: summaryText,
      messages: parsed,
    };
  }, [ticket?.description, ticket?.source]);

  if (!isOpen || !ticket) return null;

  const formattedDate = ticket.created_at
    ? new Date(ticket.created_at).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-lift border border-line animate-pop-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 flex-shrink-0">
              {ticket.source === "chat" ? (
                <MessageSquare className="h-4 w-4" />
              ) : (
                <PhoneCall className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink truncate max-w-xs sm:max-w-md">
                  {ticket.title}
                </h3>
                <span className="badge bg-surface text-ink-muted ring-1 ring-inset ring-line text-[11px]">
                  {ticket.source === "chat" ? "Chat triage" : "Voice call"}
                </span>
              </div>
              <p className="text-xs text-ink-subtle mt-0.5">
                {ticket.properties?.name || "Property"} · Unit {ticket.unit_number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SeverityBadge severity={ticket.severity} />
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon h-8 w-8 text-ink-subtle hover:text-ink ml-1"
              title="Close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tenant Details & Metadata Strip */}
        <div className="bg-surface/70 border-b border-line px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-ink-subtle" />
              <span className="font-medium text-ink">{ticket.tenant_name || "Anonymous Resident"}</span>
            </div>
            {ticket.tenant_phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-ink-subtle" />
                <span>{ticket.tenant_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-ink-subtle" />
              <span>Category: <strong className="font-medium text-ink">{ticket.category}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-ink-subtle">
            <Clock className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Content Body: Scrollable Conversation Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Diagnostic Summary Callout (if present) */}
          {summary && (
            <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700 mb-1">
                Diagnostic Findings & Summary
              </p>
              <p className="text-xs sm:text-sm text-ink leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {/* Conversation Header Label */}
          <div className="flex items-center justify-between pb-1 border-b border-line/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Complete Conversation Log
            </span>
            <span className="text-xs text-ink-subtle">
              {messages.length} {messages.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {/* Messages Stream */}
          {messages.length > 0 ? (
            <div className="space-y-3 pt-2">
              {messages.map((m) => {
                const isTenant = m.speaker === "tenant";
                const isAgent = m.speaker === "agent";

                if (isTenant) {
                  return (
                    <div key={m.id} className="flex flex-col items-end">
                      <span className="text-[11px] font-medium text-ink-subtle mb-1 mr-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticket.tenant_name || "Tenant"}
                      </span>
                      <div className="rounded-2xl rounded-tr-sm bg-brand-600 text-white px-4 py-2.5 text-xs sm:text-sm max-w-[85%] shadow-soft leading-relaxed">
                        {m.text}
                      </div>
                    </div>
                  );
                }

                if (isAgent) {
                  return (
                    <div key={m.id} className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-700 flex-shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-medium text-ink-subtle mb-1 ml-1 block">
                          Upkeep AI Assistant
                        </span>
                        <div className="rounded-2xl rounded-tl-sm bg-surface border border-line text-ink px-4 py-2.5 text-xs sm:text-sm max-w-[88%] shadow-soft leading-relaxed whitespace-pre-line">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                }

                // General note or system output
                return (
                  <div key={m.id} className="rounded-xl bg-surface/80 border border-line p-3 text-xs text-ink-muted leading-relaxed">
                    <p className="font-medium text-ink mb-0.5">Note:</p>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink-subtle mb-2">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-ink">No conversation log available</p>
              <p className="text-xs text-ink-muted mt-1">
                {ticket.description || "No transcript details were recorded for this ticket."}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-line px-6 py-3.5 bg-surface/40">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted font-medium">Status:</span>
            {onUpdateStatus ? (
              <Select
                variant="pill"
                value={ticket.status}
                onChange={(newStatus) => onUpdateStatus(ticket.id, newStatus)}
                options={STATUS_OPTIONS}
                className={STATUS_SELECT[ticket.status]}
                aria-label="Update ticket status"
              />
            ) : (
              <StatusBadge status={ticket.status} />
            )}
          </div>

          <div className="flex items-center gap-2">
            {onDeleteTicket && (
              <button
                onClick={() => {
                  onDeleteTicket(ticket.id, ticket.title);
                  onClose();
                }}
                className="btn btn-ghost h-9 px-3 text-xs text-red-600 hover:bg-red-50"
                title="Delete ticket"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="btn btn-secondary h-9 px-4 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
