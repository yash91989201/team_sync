"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
// UTILS
import { buttonVariants } from "@/components/ui/button";
// TYPES
import type { NavLinkProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NavLink(
  props: NavLinkProps & { sideNavOpen: boolean },
) {
  const pathname = usePathname();

  const { href, label, matchExact, Icon, sideNavOpen } = props;
  const isActive = matchExact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: isActive ? "secondary" : "ghost",
          size: sideNavOpen ? "default" : "icon",
        }),
        "flex gap-3 text-base font-medium [&>svg]:size-5",
        sideNavOpen ? "justify-start" : "justify-center",
      )}
    >
      <Icon />
      {sideNavOpen && <p className="text-base font-medium">{label}</p>}
    </Link>
  );
}
