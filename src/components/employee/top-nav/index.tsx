"use client";
// UI
import { Button } from "@ui/button";
// CUSTOM COMPONENTS
import UserInfo from "@/components/employee/top-nav/user-info";
import LogoutButton from "@sharedComponents/log-out-button";
import NotificationDropdown from "@/components/employee/top-nav/notification-dropdown";
// ICONS
import { Bolt } from "lucide-react";

export default function TopNav() {
  return (
    <header className="z-50 flex items-center justify-between border-b bg-white p-6 py-3 shadow-sm">
      <UserInfo />
      <div className="flex items-center gap-3">
        <NotificationDropdown />
        <Button className="rounded-xl" size="icon" variant="outline">
          <Bolt className="size-4" />
        </Button>
        <LogoutButton />
      </div>
    </header>
  );
}
