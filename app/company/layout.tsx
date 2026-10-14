import { AppNav } from "@/components/AppNav";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/company", label: "Requests" },
  { href: "/company/properties", label: "Properties" },
  { href: "/company/tenants", label: "Tenants" },
  { href: "/company/setup", label: "Agent" },
];

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireRole("company");

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav
        home="/company"
        links={LINKS}
        userName={profile.full_name || user.email || "Account"}
        context={profile.companies?.name}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
