"use client";
import Link from "next/link";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UTILS
import { cn } from "@/lib/utils";
// UI
import { Button, buttonVariants } from "@/components/ui/button";
// ICONS
import { Bell, Bolt, ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
// CUSTOM COMPONENTS
import NavLinks from "@/components/admin/side-nav/nav-links";
import LogoutButton from "./log-out-button";

export default function SideNav() {
  const sideNavToggle = useToggle(false);

  return (
    <aside
      className={cn(
        "hidden h-screen flex-shrink-0 flex-col gap-6 border-r p-3 transition-[width] duration-100 ease-in-out lg:flex",
        sideNavToggle.isOpen ? "w-64" : "w-18",
      )}
    >
      <h1 className="my-1 flex items-center justify-center border-b p-3 text-lg font-bold">
        {sideNavToggle.isOpen ? "TEAM SYNC" : "TS"}
      </h1>

      <NavLinks sideNavOpen={sideNavToggle.isOpen} />
      <section className="flex w-full flex-col gap-3">
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
        <Button
          variant="secondary"
          size={sideNavToggle.isOpen ? "default" : "icon"}
          className={cn(
            "flex items-center [&>svg]:size-5",
            sideNavToggle.isOpen ? "justify-between" : "justify-center",
          )}
          onClick={sideNavToggle.toggle}
        >
          {sideNavToggle.isOpen && (
            <p className="text-base font-semibold">Collapse</p>
          )}
          {sideNavToggle.isOpen ? <ArrowLeftToLine /> : <ArrowRightToLine />}
        </Button>
      </section>
    </aside>
  );
}
