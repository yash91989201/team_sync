// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@adminLayouts/admin-main-wrapper";
import BulkGeneratePayslip from "@adminComponents/payroll/bulk-generate-payslip";

export default async function PayrollBulkGeneratePage() {
  await authPage("ADMIN");

  return (
    <AdminMainWrapper className="space-y-6">
      <BulkGeneratePayslip />
    </AdminMainWrapper>
  );
}
