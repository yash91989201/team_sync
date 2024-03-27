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
        "flex h-12 w-12 gap-3 rounded-lg text-base font-medium ",
        sideNavOpen
          ? "w-full justify-start [&>svg]:size-5"
          : "justify-center [&>svg]:size-6",
        isActive
          ? "bg-primary/15 text-primary hover:bg-primary/15"
          : "text-gray-600",
      )}
    >
      <Icon />
      {sideNavOpen && <p className="text-base font-medium">{label}</p>}
    </Link>
  );
}
