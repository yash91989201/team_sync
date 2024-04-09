// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import LogInForm from "@/components/auth/log-in-form";

export default async function LogInPage() {
  await authPage("ADMIN", true);

  return <LogInForm role="ADMIN" />;
}
