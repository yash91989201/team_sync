// CUSTOM COMPONENTS
import NavLink from "@sharedComponents/nav-link";
// CONSTANTS
import { EMPLOYEE_ROUTES } from "@/constants/routes";

export default function NavLinks() {
  return (
    <nav className="flex flex-col gap-3">
      {EMPLOYEE_ROUTES.map((employeeRoute) => (
        <NavLink key={employeeRoute.href} {...employeeRoute} />
      ))}
    </nav>
  );
}
