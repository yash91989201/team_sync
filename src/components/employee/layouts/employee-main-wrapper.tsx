// UTILS
import { cn } from "@/lib/utils";
// TYPES
import type { ReactNode } from "react";

export default function EmployeeMainWrapper({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative flex-1 overflow-auto overflow-x-hidden p-6",
        className,
      )}
    >
      {children}
    </main>
  );
}
