import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";
import { homeFor } from "@/lib/routes";
import type { UserRole } from "@/lib/types";

const PROTECTED: Record<string, UserRole> = {
  "/company": "company",
  "/tenant": "tenant",
};

const AUTH_PAGES = ["/login", "/signup"];

function protectedRole(pathname: string): UserRole | null {
  for (const [prefix, role] of Object.entries(PROTECTED)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiredRole = protectedRole(pathname);

  if (!isSupabaseConfigured) {
    if (!requiredRole) return NextResponse.next({ request });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Refreshes the session if expired, then verifies the JWT locally against the
  // project's cached signing keys — no Auth server round trip per request.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  // Role in user metadata is only used for routing. Layouts re-check it against
  // the profiles table, and RLS protects the data itself.
  const role = (user?.user_metadata?.role as UserRole | undefined) ?? null;

  const redirect = (to: string) => {
    const res = NextResponse.redirect(new URL(to, request.url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (requiredRole && !user) {
    return redirect(`/login?next=${encodeURIComponent(pathname + search)}`);
  }

  if (requiredRole && role && role !== requiredRole) {
    return redirect(homeFor(role));
  }

  if (user && role && AUTH_PAGES.includes(pathname)) {
    return redirect(homeFor(role));
  }

  return response;
}
