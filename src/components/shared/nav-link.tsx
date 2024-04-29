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
  const { href, label, matchExact, Icon, isNested, childrens, isChildLink } =
    props;

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
            "flex h-12 w-full justify-start gap-3 rounded-lg p-3",
            nestedNav.isOpen
              ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
              : "text-gray-700",
          )}
          onClick={nestedNav.toggle}
        >
          <Icon className="size-5" />
          <p className="flex-1 text-left text-base font-medium">{label}</p>
          <ChevronDown
            className={cn(
              "size-4 transition-all duration-150 ease-in-out",
              nestedNav.isOpen && "rotate-180",
            )}
          />
        </Button>
        <div
          className={cn(
            "grid overflow-hidden transition-all duration-150 ease-out",
            nestedNav.isOpen ? "grid-rows-1" : "grid-rows-[0]",
          )}
        >
          <div className="m-3 space-y-1.5">
            {childrens?.map((nestedLink) => (
              <NavLink key={nestedLink.href} {...nestedLink} />
            ))}
          </div>
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
        }),
        "flex w-full items-center justify-start gap-3 rounded-lg",
        isChildLink ? "h-9" : "h-12 p-3",
        isActive
          ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
          : "text-gray-700",
      )}
    >
      {!isChildLink && <Icon className="size-5" />}
      <p
        className={cn(
          "flex-1 text-left text-base",
          isChildLink ? "font-normal" : "font-medium",
        )}
      >
        {label}
      </p>
    </Link>
  );
}
