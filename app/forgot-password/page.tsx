import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/PasswordForms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      footer={
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
