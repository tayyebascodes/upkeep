"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field, FormError } from "@/components/auth/Field";
import type { Profile } from "@/lib/types";

export function AccountForm({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    setError(null);

    const { error } = await createClient()
      .from("profiles")
      .update({
        full_name: String(form.get("full_name")).trim(),
        unit_number: String(form.get("unit_number")).trim(),
        phone: String(form.get("phone") || "").trim() || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) return setError(error.message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  return (
    <div>
      <p className="eyebrow">Settings</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Account</h1>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        <Field label="Full name" name="full_name" defaultValue={profile.full_name ?? ""} required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit" name="unit_number" defaultValue={profile.unit_number ?? ""} required />
          <Field label="Phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} hint="Optional" />
        </div>
        <Field label="Email" name="email" value={email} disabled readOnly />
        <FormError message={error} />
        <button type="submit" disabled={saving} className="btn btn-primary w-full">
          {saved && <Check className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </button>
      </form>

      <Link href="/forgot-password" className="btn btn-ghost mt-4 w-full text-xs">
        Change password
      </Link>
    </div>
  );
}
