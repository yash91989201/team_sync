// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import AdminSignupForm from "@/components/auth/admin-signup-form";

export default async function SignUpPage() {
  await authPage("ADMIN", true);

  return <AdminSignupForm />;
}
