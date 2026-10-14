"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { friendlyAuthError } from "@/lib/auth-errors";
import { Field, FormError } from "./Field";
import { CheckEmail } from "./CompanySignupForm";

export function TenantJoinForm({ propertySlug }: { propertySlug: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: String(form.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/tenant`,
        data: {
          role: "tenant",
          full_name: String(form.get("full_name")).trim(),
          unit_number: String(form.get("unit_number")).trim(),
          phone: String(form.get("phone") || "").trim(),
          property_slug: propertySlug,
        },
      },
    });

    if (error) {
      setError(friendlyAuthError(error.message));
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace("/tenant");
      router.refresh();
      return;
    }

    setSentTo(email);
    setLoading(false);
  };

  if (sentTo) return <CheckEmail email={sentTo} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full name" name="full_name" autoComplete="name" required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Unit" name="unit_number" placeholder="Unit 304" required />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" hint="Optional" />
      </div>
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={6} hint="6+ characters" required />
      <FormError message={error} />
      <button type="submit" disabled={loading || !isSupabaseConfigured} className="btn btn-primary w-full">
        {loading ? "Joining…" : "Join"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
