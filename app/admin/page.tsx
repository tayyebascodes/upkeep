"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Plus, 
  ExternalLink, 
  Sliders, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  PhoneCall, 
  MessageSquare,
  Search,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase, MOCK_PROPERTY, MOCK_TICKETS } from "@/lib/supabase";
import { Ticket, TicketStatus } from "@/lib/types";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS as Ticket[]);
  const [property, setProperty] = useState(MOCK_PROPERTY);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    if (supabase) {
      try {
        const { data } = await supabase
          .from("tickets")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setTickets(data as Ticket[]);
        }
      } catch (e) {
        console.warn("Using mock tickets:", e);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update Ticket Status
  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    if (supabase) {
      try {
        await supabase
          .from("tickets")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", ticketId);
      } catch (e) {
        console.error("Failed to update status in Supabase:", e);
      }
    }
  };

  // Filter logic
  const filtered = tickets.filter((t) => {
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = tickets.filter((t) => t.status === "Pending").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Maintenance Dispatch Board</h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                Live Supabase Feed
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Managing <span className="font-semibold text-slate-700">{property.name}</span> • 24/7 AI Triage Active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/setup"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition"
            >
              <Sliders className="h-4 w-4 text-blue-600" />
              <span>Configure Agent & SOPs</span>
            </Link>

            <Link
              href={`/p/${property.slug}`}
              target="_blank"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <span>Public Tenant Link</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
          <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Total Inquiries</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{tickets.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-amber-200 bg-amber-50/20 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-700">Pending Triage</p>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-sky-200 bg-sky-50/20 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-sky-700">In Progress</p>
              <Wrench className="h-4 w-4 text-sky-600" />
            </div>
            <p className="text-2xl font-bold text-sky-900 mt-1">{inProgressCount}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-emerald-200 bg-emerald-50/20 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-700">Resolved</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{resolvedCount}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by unit, title, or trade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex rounded-xl bg-slate-200/80 p-1">
              {["All", "Pending", "In Progress", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    filterStatus === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={fetchTickets}
              disabled={isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tickets Table / List */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Unit / Tenant</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{t.unit_number}</p>
                      <p className="text-xs text-slate-400">{t.tenant_name || "Anonymous Tenant"}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-semibold text-slate-900">{t.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          t.severity === "Emergency"
                            ? "bg-rose-100 text-rose-800"
                            : t.severity === "High"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        {t.source === "voice_call" ? (
                          <>
                            <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                            <span>Voice Call</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Chat</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t.id, e.target.value as TicketStatus)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold border shadow-sm transition focus:outline-none ${
                          t.status === "In Progress"
                            ? "bg-sky-50 text-sky-800 border-sky-300"
                            : t.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              No tickets found matching your filter criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
