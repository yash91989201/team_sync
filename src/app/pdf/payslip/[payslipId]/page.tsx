import { headers } from "next/headers";
// UTILS
import { env } from "@/env";
import { auth } from "@/server/helpers";
import { getPayslipDataForPdf } from "@/server/helpers/payslip";
// CUSTOM COMPONENTS
import PayslipPdfTemplate, {
  NoPayslipData,
} from "@/components/pdf/payslip-pdf-template";
import PdfPreviewWrapper from "@/components/pdf/pdf-preview-wrapper";
import PdfPreviewBlocked from "@/components/pdf/pdf-preview-blocked";

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

  const payslipDataForPdf = await getPayslipDataForPdf({ payslipId });

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
