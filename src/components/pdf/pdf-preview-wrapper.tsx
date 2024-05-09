// UTILS
import { cn } from "@/lib/utils";
// TYPES
import type { ReactNode } from "react";

export default function PdfPreviewWrapper({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      id="pdf-preview-container"
      className={cn(
        "relative mx-auto my-6 h-[297mm] w-[210mm] max-w-6xl overflow-auto overflow-x-hidden border",
        className,
      )}
    >
      {children}
    </main>
  );
}
