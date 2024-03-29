// CUSTOM COMPONENTS
import NavLink from "@/components/admin/side-nav/nav-link";
// CONSTANTS
import { EMPLOYEE_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function NavLinks({ sideNavOpen }: { sideNavOpen: boolean }) {
  return (
    <nav
      className={cn(
        "flex flex-1 flex-col gap-3",
        sideNavOpen ? "" : "items-center",
      )}
    >
      {EMPLOYEE_ROUTES.map((employeeRoute) => (
        <NavLink
          key={employeeRoute.href}
          {...employeeRoute}
          sideNavOpen={sideNavOpen}
        />
      ))}
    </nav>
  );
}
