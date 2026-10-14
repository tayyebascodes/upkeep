import { AppNav } from "@/components/AppNav";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/tenant", label: "Home" },
  { href: "/tenant/account", label: "Account" },
];

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireRole("tenant");

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav
        home="/tenant"
        links={LINKS}
        userName={profile.full_name || user.email || "Account"}
        context={[profile.properties?.name, profile.unit_number].filter(Boolean).join(" · ")}
      />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
