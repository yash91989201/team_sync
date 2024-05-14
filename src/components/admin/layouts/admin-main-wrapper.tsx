// UTILS
import { cn } from "@/lib/utils";
// TYPES
import type { ReactNode } from "react";

export default function AdminMainWrapper({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <main className={cn("p-6", className)}>{children}</main>;
}
