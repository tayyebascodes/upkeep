import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Upkeep<span className="text-brand-600">.</span>
      </Link>
      <p className="eyebrow mt-16">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found.</h1>
      <p className="mt-2 text-sm text-ink-muted">The link may be wrong or expired.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Go home
      </Link>
    </div>
  );
}
