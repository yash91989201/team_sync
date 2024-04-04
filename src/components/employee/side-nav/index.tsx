"use client";
import Link from "next/link";
// UTILS
import { cn } from "@/lib/utils";
// UI
import { buttonVariants } from "@/components/ui/button";
// ICONS
import { Bell, Bolt } from "lucide-react";
// CUSTOM COMPONENTS
import NavLinks from "@/components/employee/side-nav/nav-links";
import LogoutButton from "./log-out-button";

export default function SideNav() {
  return (
    <aside className="hidden h-screen w-64 flex-shrink-0  origin-left flex-col gap-6 border-r p-3 transition-all duration-150 ease-out md:flex">
      <h1 className="h-12 rounded-md bg-primary p-1.5 text-center align-middle text-2xl font-semibold text-white">
        TEAM SYNC
      </h1>

      <NavLinks />
      <section className="flex flex-col items-start gap-3">
        <Link
          href="/admin/notifications"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "gap-3 text-gray-700",
          )}
        >
          <Bell className="size-5" />
          <p className="text-base font-medium">Notifications</p>
        </Link>

        <Link
          href="/admin/settings"
          className={cn(
            buttonVariants({
              variant: "ghost",
            }),
            "gap-3 text-gray-700",
          )}
        >
          <Bolt className="size-5" />
          <p className="text-base font-medium">Settings</p>
        </Link>
        <LogoutButton />
      </section>
    </aside>
  );
}
