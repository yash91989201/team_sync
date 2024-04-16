// CUSTOM COMPONENTS
import NavLink from "@sharedComponents/nav-link";
// CONSTANTS
import { ADMIN_ROUTES } from "@/constants/routes";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NavLinks() {
  return (
    <ScrollArea>
      <nav className="flex w-full flex-1 flex-col items-start gap-3">
        {ADMIN_ROUTES.map((adminRoute) => (
          <NavLink key={adminRoute.href} {...adminRoute} />
        ))}
      </nav>
    </ScrollArea>
  );
}
