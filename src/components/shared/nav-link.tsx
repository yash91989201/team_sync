"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
// UTILS
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@ui/button";
// TYPES
import type { NavLinkProps } from "@/lib/types";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// ICONS
import { ChevronDown } from "lucide-react";

export default function NavLink(props: NavLinkProps) {
  const pathname = usePathname();
  const { href, label, matchExact, Icon, isNested, childrens } = props;

  const isAnyChildrenActive =
    childrens !== undefined
      ? childrens.some(({ href, matchExact }) =>
          matchExact ? pathname === href : pathname.startsWith(href),
        )
      : false;

  const nestedNav = useToggle(isAnyChildrenActive);

  const isActive = matchExact ? pathname === href : pathname.startsWith(href);

  if (isNested) {
    return (
      <div className="w-full">
        <Button
          variant={nestedNav.isOpen ? "secondary" : "ghost"}
          className={cn(
            "flex w-full justify-start gap-3 rounded-lg p-3",
            nestedNav.isOpen
              ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
              : "text-gray-700",
          )}
          onClick={nestedNav.toggle}
        >
          <Icon className="size-4" />
          <p className="flex-1 text-left text-base font-normal">{label}</p>
          <ChevronDown
            className={cn(
              "size-4 transition-all duration-150 ease-in-out",
              nestedNav.isOpen && "rotate-180",
            )}
          />
        </Button>
        <div
          className={cn(
            nestedNav.isOpen ? "block" : "hidden",
            "m-3 space-y-1.5",
          )}
        >
          {childrens?.map((nestedLink) => (
            <NavLink key={nestedLink.href} {...nestedLink} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: isActive ? "secondary" : "ghost",
          className:
            "flex w-full items-center justify-start gap-3 rounded-lg p-3",
        }),
        isActive
          ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
          : "text-gray-700",
      )}
    >
      <Icon className="size-4" />
      <p className="flex-1 text-left text-base font-normal">{label}</p>
    </Link>
  );
}
