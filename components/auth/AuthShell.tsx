import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthShell({ eyebrow, title, subtitle, footer, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-brand-400/15 blur-[120px]" />

      <Link href="/" className="text-lg font-semibold tracking-tight">
        Upkeep<span className="text-brand-600">.</span>
      </Link>

      <div className="mt-16 w-full max-w-sm">
        {eyebrow && <p className="eyebrow text-center">{eyebrow}</p>}
        <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-ink-muted">{subtitle}</p>}

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-xl bg-brand-50 p-3 text-center text-xs text-brand-800">
            Supabase not connected. Add keys to <code className="font-mono">.env</code>.
          </div>
        )}

        <div className="card mt-8 p-6 shadow-soft">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
      </div>
    </div>
  );
}
