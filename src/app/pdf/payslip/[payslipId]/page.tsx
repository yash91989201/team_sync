import { headers } from "next/headers";
// UTILS
import { env } from "@/env";
import { auth } from "@/server/helpers";
// CUSTOM COMPONENTS
import PayslipPdf from "@/components/pdf/payslip-pdf";
import PdfPreviewWrapper from "@/components/pdf/pdf-preview-wrapper";
import PdfPreviewBlocked from "@/components/pdf/pdf-preview-blocked";

export default async function PayslipPdfPreviewPage({
  params,
}: {
  params: { payslipId: string };
}) {
  const header = headers();
  const { session } = await auth();

  const generatePdfSecret = header.get("x-generate-pdf-secret");

  const allowPdfPreview =
    session !== null || generatePdfSecret === env.GENERATE_PDF_SECRET;

  if (!allowPdfPreview) {
    return <PdfPreviewBlocked />;
  }

  if (generatePdfSecret === null) {
    return (
      <PdfPreviewWrapper>
        <PayslipPdf />
      </PdfPreviewWrapper>
    );
  }

  return <PayslipPdf />;
}
