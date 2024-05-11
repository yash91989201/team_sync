"use client";
// CUSTOM COMPONENTS
import NavLinks from "@/components/admin/side-nav/nav-links";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SideNav() {
  return (
    <aside className="hidden h-screen w-72 flex-col border-r md:flex">
      <div className="z-50 flex h-20 items-center justify-center border-b bg-white p-6 py-3 shadow-sm">
        <h1 className="text-4xl font-bold text-primary">TEAM SYNC</h1>
      </div>
      <ScrollArea className="p-6 pb-0">
        <NavLinks />
      </ScrollArea>
    </aside>
  );
}
