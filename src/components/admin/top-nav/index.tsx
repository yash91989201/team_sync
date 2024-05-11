import { Suspense } from "react";
// UI
import { Button } from "@ui/button";
// CUSTOM COMPONENTS
import UserInfo from "@/components/admin/top-nav/user-info";
import LogoutButton from "@sharedComponents/log-out-button";
import UserInfoSkeleton from "@/components/shared/user-info-skeleton";
import ModuleSearchBar from "@/components/admin/top-nav/module-search-bar";
import NotificationDropdown from "@/components/admin/top-nav/notification-dropdown";
// ICONS
import { Bolt } from "lucide-react";

export default function TopNav() {
  return (
    <header className="z-50 flex h-20 items-center justify-between border-b bg-white p-6 py-3 shadow-sm">
      <Suspense fallback={<UserInfoSkeleton />}>
        <UserInfo />
      </Suspense>
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
