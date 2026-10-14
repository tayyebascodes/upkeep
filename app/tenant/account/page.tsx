import { requireRole } from "@/lib/auth";
import { AccountForm } from "./AccountForm";

export default async function TenantAccountPage() {
  const { user, profile } = await requireRole("tenant");
  return <AccountForm profile={profile} email={user.email ?? ""} />;
}
