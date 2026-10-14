"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface NavLink {
  href: string;
  label: string;
}

interface AppNavProps {
  home: string;
  links: NavLink[];
  userName: string;
  context?: string;
}

export function AppNav({ home, links, userName, context }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // Client-side sign out: clears the session cookie, then a soft navigation home.
  const handleSignOut = async () => {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  };
  const isActive = (href: string) => (href === home ? pathname === href : pathname.startsWith(href));
  const initial = userName.trim().charAt(0).toUpperCase() || "U";

  const linkEls = links.map((l) => (
    <Link
      key={l.href}
      href={l.href}
      className={`btn h-9 px-4 ${isActive(l.href) ? "bg-brand-50 text-brand-700" : "btn-ghost"}`}
    >
      {l.label}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/70 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href={home} className="text-lg font-semibold tracking-tight">
            Upkeep<span className="text-brand-600">.</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">{linkEls}</nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            {context && <p className="text-xs text-ink-subtle">{context}</p>}
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white">
            {initial}
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="btn btn-ghost btn-icon h-9 w-9"
            title="Log out"
            aria-label="Log out"
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">{linkEls}</nav>
    </header>
  );
}
