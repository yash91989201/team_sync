// CUSTOM COMPONENTS
import NavLink from "@shared/nav-link";
// CONSTANTS
import { EMPLOYEE_ROUTES } from "@/constants/routes";

export default function NavLinks() {
  return (
    <nav className="flex flex-1 flex-col gap-3">
      {EMPLOYEE_ROUTES.map((employeeRoute) => (
        <NavLink key={employeeRoute.href} {...employeeRoute} />
      ))}
    </nav>
  );
}
