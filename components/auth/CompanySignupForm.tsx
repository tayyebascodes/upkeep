"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { friendlyAuthError } from "@/lib/auth-errors";
import { Field, FormError } from "./Field";

export function CompanySignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const companyName = String(form.get("company_name")).trim();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: String(form.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/company`,
        data: {
          role: "company",
          full_name: String(form.get("full_name")).trim(),
          company_name: companyName,
          property_name: companyName,
        },
      },
    });

    if (error) {
      setError(friendlyAuthError(error.message));
      setLoading(false);
      return;
    }

    // Email confirmation off: session is live, go straight in.
    if (data.session) {
      router.replace("/company");
      router.refresh();
      return;
    }

    setSentTo(email);
    setLoading(false);
  };

  if (sentTo) return <CheckEmail email={sentTo} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Your name" name="full_name" autoComplete="name" required />
      <Field label="Company" name="company_name" autoComplete="organization" required />
      <Field label="Work email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={6} hint="6+ characters" required />
      <FormError message={error} />
      <button type="submit" disabled={loading || !isSupabaseConfigured} className="btn btn-primary w-full">
        {loading ? "Creating…" : "Create account"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}

export function CheckEmail({ email }: { email: string }) {
  return (
    <div className="py-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <MailCheck className="h-6 w-6" />
      </div>
      <p className="mt-4 font-medium">Check your email</p>
      <p className="mt-1 text-sm text-ink-muted">
        Link sent to <span className="text-ink">{email}</span>.
      </p>
    </div>
  );
}
