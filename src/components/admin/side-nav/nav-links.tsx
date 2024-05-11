// CUSTOM COMPONENTS
import NavLink from "@sharedComponents/nav-link";
// CONSTANTS
import { ADMIN_ROUTES } from "@/constants/routes";

export default function NavLinks() {
  return (
    <nav className="flex flex-col gap-3">
      {ADMIN_ROUTES.map((adminRoute) => (
        <NavLink key={adminRoute.href} {...adminRoute} />
      ))}
    </nav>
  );
}
