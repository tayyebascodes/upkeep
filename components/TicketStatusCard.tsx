import { Ticket } from "@/lib/types";
import { Wrench, Zap, Flame, Wind, Building, AlertTriangle, Clock, CheckCircle2, PhoneCall, MessageSquare } from "lucide-react";

interface TicketStatusCardProps {
  ticket: Ticket;
}

export function TicketStatusCard({ ticket }: TicketStatusCardProps) {
  // Category Icon selection
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Plumbing":
        return <Wrench className="h-5 w-5 text-sky-600" />;
      case "Electrical":
        return <Zap className="h-5 w-5 text-amber-500" />;
      case "HVAC":
        return <Wind className="h-5 w-5 text-teal-600" />;
      case "Structural":
        return <Building className="h-5 w-5 text-slate-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-indigo-600" />;
    }
  };

  // Status Badge styling (matches design reference)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            In Progress
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  // Human-friendly time formatting
  const formatTimeAgo = (dateString: string) => {
    const diffHours = Math.round((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
    if (diffHours <= 1) return "Updated just now";
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `Updated ${diffDays}d ago`;
  };

  return (
    <div className="group relative flex items-start gap-3.5 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition">
        {getCategoryIcon(ticket.category)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{ticket.title}</h4>
          {getStatusBadge(ticket.status)}
        </div>

        {ticket.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">{ticket.description}</p>
        )}

        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400">
          <span>{formatTimeAgo(ticket.updated_at || ticket.created_at)}</span>
          <span>•</span>
          <span className="font-medium text-slate-600">{ticket.unit_number}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            {ticket.source === "voice_call" ? (
              <>
                <PhoneCall className="h-3 w-3 text-blue-500" /> Voice Call
              </>
            ) : (
              <>
                <MessageSquare className="h-3 w-3 text-emerald-500" /> Chat
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
