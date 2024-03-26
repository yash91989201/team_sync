import SideNav from "@/components/admin/side-nav";
// TYPES
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex flex-col lg:flex-row lg:overflow-hidden">
      <SideNav />
      <section className="flex-1 overflow-y-auto p-3 lg:max-h-screen lg:pb-8 ">
        {children}
      </section>
    </main>
  );
}
