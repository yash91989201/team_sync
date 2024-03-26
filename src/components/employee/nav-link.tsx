"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
// UTILS
import { buttonVariants } from "@/components/ui/button";
// TYPES
import type { LucideIcon } from "lucide-react";

type NavLinkProps = {
  Icon: LucideIcon;
  label: string;
  href: string;
  matchExact: boolean;
};

export default function NavLink(props: NavLinkProps) {
  const pathname = usePathname();

  const { href, label, matchExact } = props;

  const isActive = matchExact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={buttonVariants({
        variant: isActive ? "default" : "ghost",
        className: "flex items-center justify-start gap-3",
      })}
    >
      {label}
    </Link>
  );
}
