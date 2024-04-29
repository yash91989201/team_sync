// CUSTOM COMPONENTS
import TopNav from "@/components/employee/top-nav";
import SideNav from "@/components/employee/side-nav";
// TYPES
import type { ReactNode } from "react";

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-col md:flex-row md:overflow-hidden">
      <SideNav />
      <section className="flex flex-1 flex-col bg-primary-foreground md:max-h-screen">
        <TopNav />
        {children}
      </section>
    </div>
  );
}
