import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { homeFor } from "@/lib/routes";
import type { Profile, UserRole } from "@/lib/types";

export type SessionProfile = Profile & {
  companies?: { name: string } | null;
  properties?: { name: string } | null;
};

export interface SessionUser {
  id: string;
  email: string | null;
}

// Cached per request, so layouts and pages can both call it cheaply.
// getClaims() verifies the JWT locally (asymmetric signing keys), so the only
// network call here is the single profile query.
export const getSession = cache(async (): Promise<{ user: SessionUser | null; profile: SessionProfile | null }> => {
  if (!isSupabaseConfigured) return { user: null, profile: null };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(name), properties(name)")
    .eq("id", claims.sub)
    .single();

  return {
    user: { id: claims.sub, email: claims.email ?? null },
    profile: (profile as SessionProfile | null) ?? null,
  };
});

// Authoritative role check (profiles table, not user metadata).
export async function requireRole(role: UserRole) {
  const { user, profile } = await getSession();
  if (!user) redirect("/login");
  // Signed in but no profile row: sign out first, or middleware would bounce
  // /login back here forever.
  if (!profile) redirect("/auth/signout?error=profile");
  if (profile.role !== role) redirect(homeFor(profile.role));
  return { user, profile };
}
