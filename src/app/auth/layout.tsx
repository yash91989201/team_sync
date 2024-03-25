import { redirect } from "next/navigation";
// UTILS
import { getUser } from "@/server/helpers";
// TYPES
import type { ReactNode } from "react";
// CONSTANTS
import { ADMIN_ROUTES, EMPLOYEE_ROUTES } from "@/constants/routes";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoggedIn } = await getUser();

  if (isLoggedIn) {
    const loggedInRoute =
      user?.role === "ADMIN" ? ADMIN_ROUTES.home : EMPLOYEE_ROUTES.home;
    redirect(loggedInRoute);
  }

  return (
    <main className="flex h-screen w-full items-center justify-center">
      {children}
    </main>
  );
}
