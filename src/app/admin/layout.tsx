import { redirect } from "next/navigation";
// UTILS
import { validateRequest } from "@/lib/auth";
// CUSTOM COMPONENTS
import SideNav from "@/components/admin/side-nav";
// TYPES
import type { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, session } = await validateRequest();

  if (session === null || user === null) return redirect("/auth/admin/log-in");

  if (user.role === "EMPLOYEE") return redirect("/employee-portal");

  return (
    <main className="relative flex flex-col md:flex-row md:overflow-hidden">
      <SideNav />
      <section className="flex-1 overflow-y-auto bg-gray-50 p-6 md:max-h-screen">
        {children}
      </section>
    </main>
  );
}
