import { Ticket } from "@/lib/types";
import { Wrench, Zap, Wind, Building, CircleHelp, PhoneCall, MessageSquare, Refrigerator, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

interface TicketStatusCardProps {
  ticket: Ticket;
  onDelete?: (ticketId: string, title?: string) => void;
}

const CATEGORY_ICONS = {
  Plumbing: Wrench,
  Electrical: Zap,
  HVAC: Wind,
  Appliance: Refrigerator,
  Structural: Building,
  Other: CircleHelp,
};

const formatTimeAgo = (dateString: string) => {
  const diffHours = Math.round((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
  if (diffHours <= 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
};

export function TicketStatusCard({ ticket, onDelete }: TicketStatusCardProps) {
  const Icon = CATEGORY_ICONS[ticket.category] ?? CircleHelp;
  const SourceIcon = ticket.source === "chat" ? MessageSquare : PhoneCall;

  return (
    <div className="group flex items-center gap-3.5 rounded-xl p-3 transition hover:bg-brand-50/50">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-[18px] w-[18px]" />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-ink">{ticket.title}</h4>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-subtle">
          <span>{ticket.unit_number}</span>
          <span>·</span>
          <SourceIcon className="h-3 w-3" />
          <span>{formatTimeAgo(ticket.updated_at || ticket.created_at)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={ticket.status} />
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ticket.id, ticket.title);
            }}
            className="btn btn-ghost btn-icon h-7 w-7 text-ink-subtle hover:text-red-600 hover:bg-red-50 transition"
            title="Delete request"
            aria-label="Delete request"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
