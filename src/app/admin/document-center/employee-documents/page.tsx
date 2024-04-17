// UTILS
import { api } from "@/trpc/server";
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
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import CreateEmployeeDocumentForm from "@/components/admin/employee-documents/create-employee-document";

export default async function EmployeeDocumentsPage() {
  await authPage("ADMIN");

  const employeesDocuments = await api.documentRouter.getEmployeesDocuments();

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Employee documents
          </CardTitle>
          <CardDescription>Documents added for employees</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      <CreateEmployeeDocumentForm />
    </AdminMainWrapper>
  );
}
