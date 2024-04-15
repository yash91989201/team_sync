// CUSTOM COMPONENTS
import SideNav from "@/components/employee/side-nav";
// TYPES
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "Team Sync | Employee Portal",
    default: "Employee Portal",
  },
};

export default async function EmployeePortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative flex flex-col md:flex-row md:overflow-hidden">
      <SideNav />
      <section className="flex-1 overflow-y-auto bg-gray-50 p-6 md:max-h-screen">
        {children}
      </section>
    </main>
  );
}
