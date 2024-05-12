// TYPES
import type { ReactNode } from "react";
// UI
import { ScrollArea } from "@/components/ui/scroll-area";
// CUSTOM COMPONENTS
import TopNav from "@adminComponents/top-nav";
import SideNav from "@adminComponents/side-nav";

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
        <ScrollArea
          type="always"
          className="relative h-[calc(100vh-5rem)] flex-1 overflow-hidden"
        >
          {children}
        </ScrollArea>
      </section>
    </div>
  );
}
