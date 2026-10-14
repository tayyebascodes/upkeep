import type { UserRole } from "@/lib/types";

export function homeFor(role: UserRole | null | undefined) {
  return role === "tenant" ? "/tenant" : "/company";
}

// Only allow same-site relative redirects (blocks "//evil.com" and absolute URLs).
export function safeNext(next: string | null | undefined, fallback: string) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}
