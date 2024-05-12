import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { createApiHelper } from "@/trpc/server";
import { authPage } from "@/server/helpers";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// CUSTOM COMPONENTS
import { EmployeesDocumentsTable } from "@adminComponents/tables";
import AdminMainWrapper from "@adminComponents/layouts/admin-main-wrapper";
import CreateEmployeeDocumentForm from "@adminComponents/employee-documents/create-employee-document-form";

export default async function EmployeeDocumentsPage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.documentRouter.getEmployeesDocuments.prefetch();
  const employeesDocuments = dehydrate(apiHelper.queryClient);

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Employee documents
          </CardTitle>
          <CardDescription>Documents added for employees</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={employeesDocuments}>
            <EmployeesDocumentsTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
      <CreateEmployeeDocumentForm />
    </AdminMainWrapper>
  );
}
