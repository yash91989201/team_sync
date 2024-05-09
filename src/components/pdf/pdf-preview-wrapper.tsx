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
    <div className="my-9 w-full space-y-9">
      <p className="text-center text-4xl font-bold text-primary">PDF Preview</p>
      <main
        id="pdf-preview-container"
        className={cn(
          "relative mx-auto h-[297mm] w-[210mm] overflow-auto overflow-x-hidden border",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
