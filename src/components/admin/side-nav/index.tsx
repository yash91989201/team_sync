"use client";
// CUSTOM COMPONENTS
import NavLinks from "@/components/admin/side-nav/nav-links";

export default function SideNav() {
  return (
    <aside className="hidden h-screen w-72 flex-col gap-6 border-r p-6 md:flex">
      <h1 className="h-12 rounded-md bg-primary p-1.5 text-center align-middle text-2xl font-semibold text-white">
        TEAM SYNC
      </h1>
      <NavLinks />
    </aside>
  );
}
