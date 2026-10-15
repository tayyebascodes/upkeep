"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Settings2, PhoneCall, MessageSquare, Search, RefreshCw, Trash2 } from "lucide-react";
import { SeverityBadge } from "@/components/StatusBadge";
import { Select, type SelectOption } from "@/components/Select";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { Property, Ticket, TicketStatus } from "@/lib/types";

export type BoardTicket = Ticket & { properties?: { name: string } | null };

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

interface RequestsBoardProps {
  initialTickets: BoardTicket[];
  properties: Pick<Property, "id" | "name" | "slug">[];
}

export function RequestsBoard({ initialTickets, properties }: RequestsBoardProps) {
  const supabase = useMemo(() => createClient(), []);
  const [tickets, setTickets] = useState<BoardTicket[]>(initialTickets);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [propertyId, setPropertyId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("*, properties(name)")
      .order("created_at", { ascending: false });
    if (error) console.error("Failed to load tickets:", error);
    else setTickets(data as BoardTicket[]);
    setIsLoading(false);
  }, [supabase]);

  // Live updates: refetch whenever a ticket this company can see changes.
  useEffect(() => {
    const channel = supabase
      .channel("company-tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => fetchTickets())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchTickets]);

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    const previous = tickets;
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));

    const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", ticketId);
    if (error) {
      console.error("Failed to update status:", error);
      setTickets(previous);
    }
  };

  const handleDeleteTicket = async (ticketId: string, title?: string) => {
    if (!confirm(`Are you sure you want to delete "${title || "this request"}"?`)) return;

    const previous = tickets;
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));

    try {
      const res = await fetch(`/api/tickets?id=${ticketId}`, { method: "DELETE" });
      if (!res.ok) {
        const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
        if (error) {
          console.error("Failed to delete ticket:", error);
          setTickets(previous);
        }
      }
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      setTickets(previous);
    }
  };

  const scoped = propertyId === "all" ? tickets : tickets.filter((t) => t.property_id === propertyId);

  const filtered = scoped.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.unit_number.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.tenant_name ?? "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const metrics = [
    { label: "Total", value: scoped.length },
    { label: "Pending", value: scoped.filter((t) => t.status === "Pending").length },
    { label: "In progress", value: scoped.filter((t) => t.status === "In Progress").length },
    { label: "Resolved", value: scoped.filter((t) => t.status === "Resolved").length },
  ];

  const tenantLink = properties[0] ? `/p/${properties[0].slug}` : null;

  return (
    <>
      <PageHeader
        eyebrow={properties.length === 1 ? properties[0].name : "All properties"}
        title="Requests"
        actions={
          <>
            <Link href="/company/setup" className="btn btn-secondary">
              <Settings2 className="h-4 w-4" />
              Configure
            </Link>
            {tenantLink && (
              <Link href={tenantLink} target="_blank" className="btn btn-primary">
                Tenant link
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </>
        }
      />

      {/* Metrics */}
      <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`card p-5 ${i === 0 ? "border-brand-600 bg-brand-600 text-white" : ""}`}
          >
            <p className={`text-xs ${i === 0 ? "text-brand-100" : "text-ink-muted"}`}>{m.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-col items-center justify-between gap-3 lg:flex-row">
        <div className="flex w-full gap-2 lg:w-auto">
          <div className="relative flex-1 lg:w-72 lg:flex-none">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input rounded-full pl-10"
            />
          </div>
          {properties.length > 1 && (
            <Select
              value={propertyId}
              onChange={setPropertyId}
              options={[{ value: "all", label: "All properties" }, ...properties.map((p) => ({ value: p.id, label: p.name }))]}
              className="w-auto max-w-[220px] rounded-full"
              aria-label="Property"
            />
          )}
        </div>

        <div className="flex w-full items-center justify-end gap-2 lg:w-auto">
          <div className="segmented">
            {["All", "Pending", "In Progress", "Resolved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`segmented-item ${filterStatus === tab ? "segmented-item-active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="btn btn-secondary btn-icon h-9 w-9"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-brand-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-xs text-ink-subtle">
                <th className="px-5 py-3 font-medium">Unit</th>
                <th className="px-5 py-3 font-medium">Issue</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Channel</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {filtered.map((t) => (
                <tr key={t.id} className="transition hover:bg-brand-50/40">
                  <td className="px-5 py-4">
                    <p className="font-medium">{t.unit_number}</p>
                    <p className="text-xs text-ink-subtle">
                      {t.tenant_name || "Anonymous"}
                      {properties.length > 1 && t.properties?.name ? ` · ${t.properties.name}` : ""}
                    </p>
                  </td>

                  <td className="max-w-sm px-5 py-4">
                    <p className="font-medium">{t.title}</p>
                    <p className="line-clamp-1 text-xs text-ink-muted">{t.description}</p>
                  </td>

                  <td className="px-5 py-4 text-ink-muted">{t.category}</td>

                  <td className="px-5 py-4">
                    <SeverityBadge severity={t.severity} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                      {t.source === "chat" ? (
                        <MessageSquare className="h-3.5 w-3.5 text-brand-600" />
                      ) : (
                        <PhoneCall className="h-3.5 w-3.5 text-brand-600" />
                      )}
                      {t.source === "chat" ? "Chat" : "Call"}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <Select
                      variant="pill"
                      value={t.status}
                      onChange={(status) => handleUpdateStatus(t.id, status)}
                      options={STATUS_OPTIONS}
                      className={STATUS_SELECT[t.status]}
                      aria-label={`Status for ${t.title}`}
                    />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDeleteTicket(t.id, t.title)}
                      className="btn btn-ghost btn-icon h-8 w-8 text-ink-subtle hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete request"
                      aria-label="Delete request"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 &&
          (tickets.length === 0 ? (
            <EmptyState
              title="No requests yet"
              body="Share your tenant link to get started."
              action={
                <Link href="/company/properties" className="btn btn-secondary">
                  Get tenant link
                </Link>
              }
            />
          ) : (
            <EmptyState title="No matching requests." />
          ))}
      </div>
    </>
  );
}
