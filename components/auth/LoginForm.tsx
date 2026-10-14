"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { friendlyAuthError } from "@/lib/auth-errors";
import { homeFor, safeNext } from "@/lib/routes";
import { Field, FormError } from "./Field";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (error) {
      setError(friendlyAuthError(error.message));
      setLoading(false);
      return;
    }

    router.replace(safeNext(next, homeFor(data.user.user_metadata?.role)));
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <div>
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
        <Link href="/forgot-password" className="mt-2 inline-block text-xs text-ink-muted hover:text-brand-700">
          Forgot password?
        </Link>
      </div>
      <FormError message={error} />
      <button type="submit" disabled={loading || !isSupabaseConfigured} className="btn btn-primary w-full">
        {loading ? "Logging in…" : "Log in"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
