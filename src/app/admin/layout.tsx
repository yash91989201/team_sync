// CUSTOM COMPONENTS
import TopNav from "@/components/admin/top-nav";
import SideNav from "@/components/admin/side-nav";
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
      <section className="flex-1 md:max-h-screen bg-primary-foreground flex flex-col">
        <TopNav />
        {children}
      </section>
    </div>
  );
}
