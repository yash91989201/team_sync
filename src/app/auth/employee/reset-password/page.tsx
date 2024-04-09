// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import ResetPasswordForm from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage() {
  await authPage("EMPLOYEE", true);

  return <ResetPasswordForm role="EMPLOYEE" />;
}
