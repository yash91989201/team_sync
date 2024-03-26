// CUSTOM COMPONENTS
import NavLink from "@/components/admin/side-nav/nav-link";
// CONSTANTS
import { ADMIN_ROUTES } from "@/constants/routes";

export default function NavLinks({ sideNavOpen }: { sideNavOpen: boolean }) {
  return (
    <nav className="flex flex-1 flex-col gap-3">
      {ADMIN_ROUTES.map((adminRoute) => (
        <NavLink
          key={adminRoute.href}
          {...adminRoute}
          label={sideNavOpen ? adminRoute.label : ""}
        />
      ))}
    </nav>
  );
}
