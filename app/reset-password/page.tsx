import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/PasswordForms";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="New password">
      <ResetPasswordForm />
    </AuthShell>
  );
}
