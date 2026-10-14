import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { CompanySignupForm } from "@/components/auth/CompanySignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="For property managers"
      title="Start with Upkeep"
      subtitle="Your agent is live in minutes."
      footer={
        <>
          Have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <CompanySignupForm />
    </AuthShell>
  );
}
