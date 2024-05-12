// TYPES
import type { ReactNode } from "react";
// CUSTOM COMPONENTS
import TopNav from "@empComponents/top-nav";
import SideNav from "@empComponents/side-nav";

export default async function EmployeeRootLayout({
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
