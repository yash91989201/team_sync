// UTILS
import { cn } from "@/lib/utils";
// TYPES
import type { ReactNode } from "react";
// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PdfPreviewWrapper({
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

export function PdfPreviewBlocked() {
  return (
    <PdfPreviewWrapper>
      <Card className="rounded-none border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Payslip PDF preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are not authorized to view this page</p>
        </CardContent>
      </Card>
    </PdfPreviewWrapper>
  );
}
