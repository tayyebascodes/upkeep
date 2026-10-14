// Shown instantly on navigation while the server renders the next page.
export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-24 rounded-full bg-brand-100" />
      <div className="mt-3 h-8 w-48 rounded-lg bg-line" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl border border-line bg-white" />
        ))}
      </div>
    </div>
  );
}
