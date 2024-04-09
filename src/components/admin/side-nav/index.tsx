"use client";
import Link from "next/link";
// UTILS
import { cn } from "@/lib/utils";
// UI
import { buttonVariants } from "@/components/ui/button";
// CUSTOM COMPONENTS
import NavLinks from "@/components/admin/side-nav/nav-links";
import LogoutButton from "@/components/admin/side-nav/log-out-button";
// ICONS
import { Bell, Bolt } from "lucide-react";

export default function SideNav() {
  return (
    <aside className="hidden h-screen w-60 flex-col gap-6 border-r p-3 md:flex">
      <h1 className="h-12 rounded-md bg-primary p-1.5 text-center align-middle text-2xl font-semibold text-white">
        TEAM SYNC
      </h1>

      <NavLinks />
      <section className="flex  flex-col gap-3">
        <Link
          href="/admin/notifications"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "justify-start gap-3 text-gray-700",
          )}
        >
          <Bell className="size-5" />
          <p className="text-base font-normal">Notifications</p>
        </Link>

        <Link
          href="/admin/settings"
          className={cn(
            buttonVariants({
              variant: "ghost",
            }),
            "justify-start gap-3 text-gray-700",
          )}
        >
          <Bolt className="size-5" />
          <p className="text-base font-normal">Settings</p>
        </Link>
        <LogoutButton />
      </section>
    </aside>
  );
}
