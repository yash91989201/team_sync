"use client";
// UI
import { Button } from "@ui/button";
// CUSTOM COMPONENTS
import UserInfo from "@/components/admin/top-nav/user-info";
import LogoutButton from "@/components/admin/side-nav/log-out-button";
import ModuleSearchBar from "@/components/admin/top-nav/module-search-bar";
import NotificationDropdown from "@/components/admin/top-nav/notification-dropdown";
// ICONS
import { Bolt } from "lucide-react";

export default function TopNav() {
   return (
      <header className="flex items-center justify-between border-b bg-white p-6 py-3 shadow-sm z-50">
         <UserInfo />
         <div className="flex items-center gap-3">
            <ModuleSearchBar />
            <NotificationDropdown />
            <Button className="rounded-xl" size="icon" variant="outline">
               <Bolt className="size-4" />
            </Button>
            <LogoutButton />
         </div>
      </header>
   );
}






