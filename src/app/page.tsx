import { redirect } from "next/navigation";
// UTILS
import { validateRequest } from "@/lib/auth";
// CUSTOM COMPONENTS
import LoginForm from "@/components/auth/log-in-form";
// CONSTANTS
import {
  DEFAULT_ADMIN_ROUTE,
  DEFAULT_EMPLOYEE_ROUTE,
} from "@/constants/routes";

export default async function Home() {
  const { user, session } = await validateRequest();

  if (session !== null || user !== null)
    return redirect(
      user.role === "ADMIN" ? DEFAULT_ADMIN_ROUTE : DEFAULT_EMPLOYEE_ROUTE,
    );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <LoginForm role="EMPLOYEE" />
    </main>
  );
}
