import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
}

// Log out button.
export async function POST(request: Request) {
  await signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

// Used by server redirects when a session is unusable (e.g. missing profile).
export async function GET(request: Request) {
  await signOut();
  const error = new URL(request.url).searchParams.get("error");
  const to = error === "profile" ? "/login?error=profile" : "/login";
  return NextResponse.redirect(new URL(to, request.url));
}
