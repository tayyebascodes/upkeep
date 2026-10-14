import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { homeFor } from "@/lib/routes";

export async function Navbar() {
  const { profile } = await getSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/70 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Upkeep<span className="text-brand-600">.</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/features" className="btn btn-ghost h-9 px-4">
              Features
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost h-9 px-4">
              How it works
            </Link>
            <Link href="/for-tenants" className="btn btn-ghost h-9 px-4">
              Tenants
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-1">
          {profile ? (
            <Link href={homeFor(profile.role)} className="btn btn-primary h-9 px-4">
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost h-9 px-4">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary ml-1 h-9 px-4">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
