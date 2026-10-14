import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { homeFor, safeNext } from "@/lib/routes";

// Email confirmation, magic links and password recovery land here with ?code=.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = safeNext(searchParams.get("next"), homeFor(data.user?.user_metadata?.role));
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
