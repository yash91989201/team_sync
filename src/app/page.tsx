// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import LoginForm from "@/components/auth/log-in-form";

export default async function Home() {
  await authPage(undefined, true);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <LoginForm role="EMPLOYEE" />
    </main>
  );
}
