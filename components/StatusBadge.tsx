import { TicketSeverity, TicketStatus } from "@/lib/types";

const STATUS_STYLES: Record<TicketStatus, { badge: string; dot: string }> = {
  Pending: { badge: "bg-white text-ink-muted ring-1 ring-inset ring-line", dot: "bg-ink-subtle" },
  "In Progress": { badge: "bg-brand-50 text-brand-700", dot: "bg-brand-500 animate-pulse" },
  Resolved: { badge: "bg-brand-600 text-white", dot: "bg-white" },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`badge ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: TicketSeverity }) {
  const style =
    severity === "Emergency"
      ? "bg-red-50 text-red-700"
      : severity === "High"
      ? "bg-brand-100 text-brand-800"
      : "bg-surface text-ink-muted";
  return <span className={`badge ${style}`}>{severity}</span>;
}
