// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import BulkUpload from "@adminComponents/employee-documents/bulk-upload";
import AdminMainWrapper from "@adminComponents/layouts/admin-main-wrapper";

export default async function DocumentBulkUploadPage() {
  await authPage("ADMIN");

  return (
    <AdminMainWrapper className="space-y-3">
      <BulkUpload />
    </AdminMainWrapper>
  );
}
