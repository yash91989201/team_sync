// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import NewVerificationForm from "@/components/auth/new-verification-form";

export default async function NewVerificationPage() {
  await authPage("ADMIN", true);

  return <NewVerificationForm role="ADMIN" />;
}
