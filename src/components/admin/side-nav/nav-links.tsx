// CUSTOM COMPONENTS
import NavLink from "@/components/shared/nav-link";
// CONSTANTS
import { ADMIN_ROUTES } from "@/constants/routes";

export default function NavLinks() {
  return (
    <nav className=" flex w-full flex-1 flex-col items-start gap-3">
      {ADMIN_ROUTES.map((adminRoute) => (
        <NavLink key={adminRoute.href} {...adminRoute} />
      ))}
    </nav>
  );
}
