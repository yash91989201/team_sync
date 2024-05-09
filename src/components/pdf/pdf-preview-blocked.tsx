// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// CUSTOM COMPONENTS
import PdfPreviewWrapper from "@/components/pdf/pdf-preview-wrapper";

export default function PdfPreviewBlocked() {
  return (
    <PdfPreviewWrapper>
      <Card>
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
