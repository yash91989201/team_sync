import { redirect } from "next/navigation";
// UTILS
import { getUser } from "@/server/helpers";
// TYPES
import type { ReactNode } from "react";
// CONSTANTS
import {
  DEFAULT_ADMIN_ROUTE,
  DEFAULT_EMPLOYEE_ROUTE,
} from "@/constants/routes";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoggedIn } = await getUser();

  if (isLoggedIn) {
    const loggedInRoute =
      user?.role === "ADMIN" ? DEFAULT_ADMIN_ROUTE : DEFAULT_EMPLOYEE_ROUTE;
    redirect(loggedInRoute);
  }

  return (
    <main className="flex h-screen w-full items-center justify-center">
      {children}
    </main>
  );
}
