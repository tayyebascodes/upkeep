import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

const ERRORS: Record<string, string> = {
  link: "That link expired or was already used.",
  profile: "Account setup incomplete. Contact support.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      footer={
        <>
          New company?{" "}
          <Link href="/signup" className="font-medium text-brand-700 hover:underline">
            Create an account
          </Link>
          <p className="mt-2 text-xs text-ink-subtle">Tenants: use the link from your property manager.</p>
        </>
      }
    >
      <LoginForm next={next} initialError={error ? ERRORS[error] ?? null : null} />
    </AuthShell>
  );
}
