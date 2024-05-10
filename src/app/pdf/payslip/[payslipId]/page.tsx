import { headers } from "next/headers";
// UTILS
import { env } from "@/env";
import { api } from "@/trpc/server";
import { auth } from "@/server/helpers";
// CUSTOM COMPONENTS
import { PdfPreviewWrapper, PdfPreviewBlocked } from "@/components/pdf";
import { NoPayslipData, PayslipPdfTemplate } from "@/components/pdf/payslip";

export default async function PayslipPdfPreviewPage({
  params,
}: {
  params: { payslipId: string };
}) {
  const header = headers();
  const { session } = await auth();
  const { payslipId } = params;

  const generatePdfSecret = header.get("x-generate-pdf-secret");

  const allowPdfPreview =
    session !== null || generatePdfSecret === env.GENERATE_PDF_SECRET;

  if (!allowPdfPreview) {
    return <PdfPreviewBlocked />;
  }

  const payslipDataForPdf = await api.payslipRouter.getPayslipData({
    payslipId,
  });

  if (payslipDataForPdf.status == "FAILED") {
    return <NoPayslipData />;
  }

  if (generatePdfSecret === null) {
    return (
      <PdfPreviewWrapper>
        <PayslipPdfTemplate
          previewMode={true}
          payslipData={payslipDataForPdf.data}
        />
      </PdfPreviewWrapper>
    );
  }

  return (
    <PayslipPdfTemplate
      previewMode={false}
      payslipData={payslipDataForPdf.data}
    />
  );
}
