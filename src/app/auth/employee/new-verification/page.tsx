// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import NewVerificationForm from "@/components/auth/new-verification-form";

export default async function NewVerificationPage() {
  await authPage("EMPLOYEE", true);

  return <NewVerificationForm role="EMPLOYEE" />;
}
