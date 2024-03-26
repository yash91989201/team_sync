import SideNav from "@/components/admin/side-nav";
// TYPES
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex flex-col md:flex-row md:overflow-hidden">
      <SideNav />
      <section className="flex-1 overflow-y-auto p-3 md:max-h-screen">
        {children}
      </section>
    </main>
  );
}
