"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquare, PhoneCall } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TicketStatusCard } from "@/components/TicketStatusCard";
import { VoiceCallModal } from "@/components/VoiceCallModal";
import { ChatDrawer } from "@/components/ChatDrawer";
import { ConversationModal } from "@/components/ConversationModal";
import type { Profile, Property, Ticket } from "@/lib/types";

interface TenantHomeProps {
  profile: Profile;
  property: Property;
  initialTickets: Ticket[];
}

export function TenantHome({ profile, property, initialTickets }: TenantHomeProps) {
  const supabase = useMemo(() => createClient(), []);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTab, setActiveTab] = useState<"Active" | "Resolved" | "All">("Active");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = useCallback(async () => {
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .eq("tenant_id", profile.id)
      .order("created_at", { ascending: false });
    if (data) setTickets(data as Ticket[]);
  }, [supabase, profile.id]);

  // Live status updates as the company works the ticket.
  useEffect(() => {
    const channel = supabase
      .channel("tenant-tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `tenant_id=eq.${profile.id}` },
        () => fetchTickets()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, profile.id, fetchTickets]);

  const handleDeleteTicket = async (id: string, title?: string) => {
    if (!confirm(`Are you sure you want to delete "${title || "this request"}"?`)) return;

    setTickets((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tickets?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        await supabase.from("tickets").delete().eq("id", id);
      }
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      fetchTickets();
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "Active") return t.status !== "Resolved";
    if (activeTab === "Resolved") return t.status === "Resolved";
    return true;
  });

  const firstName = profile.full_name?.split(" ")[0];
  const caller = {
    propertyName: property?.name ?? "Your property",
    propertyId: profile.property_id!,
    unitNumber: profile.unit_number ?? "",
    tenantId: profile.id,
    tenantName: profile.full_name ?? undefined,
    tenantPhone: profile.phone ?? undefined,
    onTicketCreated: fetchTickets,
  };

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">{property?.name}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {firstName ? `Hi, ${firstName}.` : "Hi."}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">What needs fixing?</p>
      </header>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="flex flex-col items-start gap-6 rounded-2xl bg-brand-600 p-5 text-left text-white shadow-lift transition hover:bg-brand-700 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Call</p>
            <p className="text-xs text-brand-100">Talk to the agent</p>
          </div>
        </button>

        <button
          onClick={() => setIsChatOpen(true)}
          className="card flex flex-col items-start gap-6 p-5 text-left transition hover:border-brand-200 hover:bg-brand-50/40 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Chat</p>
            <p className="text-xs text-ink-muted">Type it out</p>
          </div>
        </button>
      </div>

      {/* Requests */}
      <section className="card p-2">
        <div className="flex items-center justify-between px-3 pb-2 pt-3">
          <h2 className="text-sm font-medium">My requests</h2>
          <div className="segmented">
            {(["Active", "Resolved", "All"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`segmented-item px-3 py-1 ${activeTab === tab ? "segmented-item-active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketStatusCard 
              key={ticket.id} 
              ticket={ticket} 
              onDelete={handleDeleteTicket}
              onView={(t) => setSelectedTicket(t)}
            />
          ))
        ) : (
          <p className="py-10 text-center text-sm text-ink-subtle">Nothing here.</p>
        )}
      </section>

      {property?.emergency_contact && (
        <p className="text-center text-xs text-ink-subtle">
          Emergency? Call 911, then{" "}
          <a href={`tel:${property.emergency_contact}`} className="font-medium text-brand-700">
            {property.emergency_contact}
          </a>
        </p>
      )}

      <VoiceCallModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} {...caller} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} {...caller} />

      <ConversationModal
        ticket={selectedTicket}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        onDeleteTicket={(id, title) => {
          handleDeleteTicket(id, title);
          setSelectedTicket(null);
        }}
      />
    </div>
  );
}

