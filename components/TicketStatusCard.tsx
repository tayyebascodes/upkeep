import { Ticket } from "@/lib/types";
import { Wrench, Zap, Wind, Building, CircleHelp, PhoneCall, MessageSquare, Refrigerator } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

interface TicketStatusCardProps {
  ticket: Ticket;
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

export function TicketStatusCard({ ticket }: TicketStatusCardProps) {
  const Icon = CATEGORY_ICONS[ticket.category] ?? CircleHelp;
  const SourceIcon = ticket.source === "chat" ? MessageSquare : PhoneCall;

  return (
    <div className="flex items-center gap-3.5 rounded-xl p-3 transition hover:bg-brand-50/50">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-[18px] w-[18px]" />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium">{ticket.title}</h4>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-subtle">
          <span>{ticket.unit_number}</span>
          <span>·</span>
          <SourceIcon className="h-3 w-3" />
          <span>{formatTimeAgo(ticket.updated_at || ticket.created_at)}</span>
        </div>
      </div>

      <StatusBadge status={ticket.status} />
    </div>
  );
}
