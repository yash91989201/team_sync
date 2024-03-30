// CUSTOM COMPONENTS
import NavLink from "@/components/shared/nav-link";
// CONSTANTS
import { ADMIN_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function NavLinks({ sideNavOpen }: { sideNavOpen: boolean }) {
  return (
    <nav
      className={cn(
        "flex flex-1 flex-col gap-3",
        sideNavOpen ? "" : "items-center",
      )}
    >
      {ADMIN_ROUTES.map((adminRoute) => (
        <NavLink
          key={adminRoute.href}
          {...adminRoute}
          sideNavOpen={sideNavOpen}
        />
      ))}
    </nav>
  );
}
