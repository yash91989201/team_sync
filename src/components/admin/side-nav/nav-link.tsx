"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
// UTILS
import { buttonVariants } from "@/components/ui/button";
// TYPES
import type { NavLinkProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NavLink(props: NavLinkProps) {
  const pathname = usePathname();

  const { href, label, matchExact, Icon } = props;
  const sideNavOpen = label.length > 0;
  const isActive = matchExact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: isActive ? "secondary" : "ghost",
          size: sideNavOpen ? "default" : "icon",
        }),
        "gap-3 [&>svg]:size-5",
        sideNavOpen ? "justify-start" : "justify-center",
      )}
    >
      <Icon />
      {sideNavOpen && <p>{label}</p>}
    </Link>
  );
}
