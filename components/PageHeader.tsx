interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {body && <p className="mt-1 text-sm text-ink-subtle">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
