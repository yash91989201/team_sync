"use client";
import Link from "next/link";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UTILS
import { cn } from "@/lib/utils";
// UI
import { Button, buttonVariants } from "@/components/ui/button";
// ICONS
import { Bell, Bolt, ChevronFirst, ChevronLast } from "lucide-react";
// CUSTOM COMPONENTS
import NavLinks from "@/components/admin/side-nav/nav-links";
import LogoutButton from "./log-out-button";

export default function SideNav() {
  const sideNavToggle = useToggle(true);

  return (
    <aside
      className={cn(
        "hidden h-screen flex-shrink-0 origin-left  flex-col gap-6 border-r transition-all duration-150 ease-out md:flex",
        sideNavToggle.isOpen ? "w-64 p-6" : "w-20 p-3",
      )}
    >
      <div
        className={cn(
          "flex items-center",
          sideNavToggle.isOpen ? "justify-between" : "justify-center",
        )}
      >
        <h1
          className={cn(
            "text-lg font-bold",
            sideNavToggle.isOpen ? "" : "w-0 overflow-hidden",
          )}
        >
          TEAM SYNC
        </h1>
        <Button
          variant={sideNavToggle.isOpen ? "secondary" : "default"}
          size="icon"
          className="h-12 w-12"
          onClick={sideNavToggle.toggle}
        >
          {sideNavToggle.isOpen ? <ChevronFirst /> : <ChevronLast />}
        </Button>
      </div>

      <NavLinks sideNavOpen={sideNavToggle.isOpen} />
      <section
        className={cn(
          "flex w-full flex-col gap-3",
          sideNavToggle.isOpen ? "" : "items-center",
        )}
      >
        <Link
          href="/admin/notifications"
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: sideNavToggle.isOpen ? "default" : "icon",
            }),
            "gap-3 [&>svg]:size-5",
            sideNavToggle.isOpen ? "justify-start" : "justify-center",
          )}
        >
          <Bell />
          {sideNavToggle.isOpen && (
            <p className="text-base font-medium">Notifications</p>
          )}
        </Link>

        <Link
          href="/admin/settings"
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: sideNavToggle.isOpen ? "default" : "icon",
            }),
            "gap-3 [&>svg]:size-5",
            sideNavToggle.isOpen ? "justify-start" : "justify-center",
          )}
        >
          <Bolt />
          {sideNavToggle.isOpen && (
            <p className="text-base font-medium">Settings</p>
          )}
        </Link>
        <LogoutButton sideNavOpen={sideNavToggle.isOpen} />
      </section>
    </aside>
  );
}
