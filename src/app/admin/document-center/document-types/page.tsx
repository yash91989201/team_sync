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
import CreateDocumentTypeForm from "@/components/admin/document-types/create-document-type-form";
import DocumentTypeTable from "@/components/admin/document-types/document-type-table";

export default async function DocumentTypesPage() {
  await authPage("ADMIN");

  const documentTypes = await api.documentRouter.getTypes();

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Document types
          </CardTitle>
          <CardDescription>
            Types of documents that can be uploaded for employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentTypeTable initialData={documentTypes} />
        </CardContent>
      </Card>
      <CreateDocumentTypeForm />
    </AdminMainWrapper>
  );
}
