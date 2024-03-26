// CUSTOM COMPONENTS
import NavLink from "@/components/employee/nav-link";
// CONSTANTS
import { EMPLOYEE_ROUTES } from "@/constants/routes";

export default function NavLinks() {
  return EMPLOYEE_ROUTES.map((employeeRoute) => (
    <NavLink key={employeeRoute.href} {...employeeRoute} />
  ));
}
