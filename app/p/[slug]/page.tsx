"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Building2, 
  MessageSquare, 
  PhoneCall, 
  Video, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  Flame,
  AlertCircle
} from "lucide-react";
import { supabase, isSupabaseConfigured, MOCK_PROPERTY, MOCK_TICKETS } from "@/lib/supabase";
import { Ticket } from "@/lib/types";
import { TicketStatusCard } from "@/components/TicketStatusCard";
import { VoiceCallModal } from "@/components/VoiceCallModal";
import { ChatDrawer } from "@/components/ChatDrawer";

export default function TenantPortalPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "sunset-heights";

  const [property, setProperty] = useState(MOCK_PROPERTY);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS as Ticket[]);
  const [activeTab, setActiveTab] = useState<"Active" | "Resolved" | "All">("Active");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("Unit 304");

  // Fetch real property and tickets if Supabase is connected
  const fetchData = async () => {
    if (!supabase) return;

    try {
      // 1. Fetch Property
      const { data: propData } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", slug)
        .single();

      if (propData) {
        setProperty(propData);

        // 2. Fetch Tickets for this property
        const { data: ticketData } = await supabase
          .from("tickets")
          .select("*")
          .eq("property_id", propData.id)
          .order("created_at", { ascending: false });

        if (ticketData && ticketData.length > 0) {
          setTickets(ticketData as Ticket[]);
        }
      }
    } catch (e) {
      console.warn("Using mock property data:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Filtered tickets based on active tab
  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "Active") return t.status !== "Resolved";
    if (activeTab === "Resolved") return t.status === "Resolved";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start pb-12 pt-6 px-4 sm:px-6">
      {/* Mobile-Friendly Main Container */}
      <div className="w-full max-w-md space-y-5">
        
        {/* Step 1: Welcome to Your Property Card (Matches Design Reference) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-blue-50/40 p-6 shadow-sm border border-slate-200/90 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
            <Building2 className="h-7 w-7" />
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
            <Sparkles className="h-3 w-3 text-blue-600" /> 24/7 AI Maintenance
          </span>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {property.name}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Submit maintenance requests, ask questions and track your requests — all in one place.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <label className="text-xs font-medium text-slate-500">Your Unit:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="Unit 304">Unit 304</option>
              <option value="Unit 210">Unit 210</option>
              <option value="Unit 105">Unit 105</option>
              <option value="Building Common">Building Common</option>
            </select>
          </div>
        </div>

        {/* Step 2: Submit a Query (Matches Design Step 2) */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/90">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Submit a Request</h2>
          <p className="text-xs text-slate-500 mb-3.5">
            Choose how you want to submit your request — chat, voice call or web call.
          </p>

          <div className="space-y-2.5">
            {/* Option 1: Live Text Chat */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="group flex w-full items-center justify-between rounded-2xl bg-slate-50/80 p-3.5 border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/40 active:scale-[0.99] transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Chat</h3>
                  <p className="text-[11px] text-slate-500">Type your message</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
            </button>

            {/* Option 2: ElevenLabs Voice Call */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="group flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3.5 text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white">Voice Call</h3>
                    <span className="rounded-full bg-emerald-400/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-100 border border-emerald-300/30">
                      LIVE AI
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100">Speak to the agent naturally</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-200 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Option 3: Web / Video Call */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="group flex w-full items-center justify-between rounded-2xl bg-slate-50/80 p-3.5 border border-slate-200/70 hover:border-slate-300 active:scale-[0.99] transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200/80 text-slate-700">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Web Call</h3>
                  <p className="text-[11px] text-slate-500">Start an interactive audio/web call</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Step 3: Track Live Status (Matches Design Step 3) */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/90">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">My Requests</h2>
            <span className="text-[11px] text-slate-400 font-medium">Real-time sync</span>
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-3.5">
            {(["Active", "Resolved", "All"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  activeTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Requests List */}
          <div className="space-y-2.5">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <TicketStatusCard key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No {activeTab.toLowerCase()} requests found for your unit.
              </div>
            )}
          </div>
        </div>

        {/* Happy Tenants Footer Banner */}
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200/80">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Happy Tenants</h4>
            <p className="text-[11px] text-emerald-700">Quick support, clear updates, less hassle.</p>
          </div>
        </div>
      </div>

      {/* Voice Call Modal Popup */}
      <VoiceCallModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        propertyName={property.name}
        propertyId={property.id}
        unitNumber={selectedUnit}
        onTicketCreated={fetchData}
      />

      {/* Text Chat Drawer Popup */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        propertyName={property.name}
        propertyId={property.id}
        unitNumber={selectedUnit}
        onTicketCreated={fetchData}
      />
    </div>
  );
}
