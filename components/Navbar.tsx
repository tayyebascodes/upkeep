import Link from "next/link";
import { Building2, Sparkles, LayoutDashboard, ExternalLink } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">Upkeep</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                <Sparkles className="h-2.5 w-2.5 text-blue-600" /> AI Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Real Estate Maintenance</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-500" />
            <span>Company Dashboard</span>
          </Link>

          <Link
            href="/p/sunset-heights"
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition border border-blue-200/60"
          >
            <span>Tenant Demo Portal</span>
            <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
