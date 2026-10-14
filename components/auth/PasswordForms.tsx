"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { friendlyAuthError } from "@/lib/auth-errors";
import { homeFor } from "@/lib/routes";
import { Field, FormError } from "./Field";
import { CheckEmail } from "./CompanySignupForm";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setLoading(true);
    setError(null);

    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);
    if (error) return setError(friendlyAuthError(error.message));
    setSentTo(email);
  };

  if (sentTo) return <CheckEmail email={sentTo} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <FormError message={error} />
      <button type="submit" disabled={loading || !isSupabaseConfigured} className="btn btn-primary w-full">
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) return setError("Passwords don't match.");

    setLoading(true);
    setError(null);
    const { data, error } = await createClient().auth.updateUser({ password });

    if (error) {
      setLoading(false);
      return setError(friendlyAuthError(error.message));
    }
    router.replace(homeFor(data.user.user_metadata?.role));
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={6} required />
      <Field label="Confirm" name="confirm" type="password" autoComplete="new-password" minLength={6} required />
      <FormError message={error} />
      <button type="submit" disabled={loading || !isSupabaseConfigured} className="btn btn-primary w-full">
        {loading ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
