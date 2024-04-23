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
import { DocumentTypeTable } from "@/components/admin/tables";
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import CreateDocumentTypeForm from "@/components/admin/document-types/create-document-type-form";

export default async function DocumentTypesPage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.documentRouter.getTypes.prefetch();
  const documentTypes = dehydrate(apiHelper.queryClient);

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Document types
          </CardTitle>
          <CardDescription>
            Types of documents that can be uploaded for an employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={documentTypes}>
            <DocumentTypeTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
      <CreateDocumentTypeForm />
    </AdminMainWrapper>
  );
}
