// UTILS
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
import AdminMainWrapper from "@adminComponents/layouts/admin-main-wrapper";
import { api } from "@/trpc/server";
import UpdateEmployeeDocumentForm from "@adminComponents/employee-documents/update-employee-document-form";

export default async function UpdateDocumentPage({
  params,
}: {
  params: { documentId: string };
}) {
  await authPage("ADMIN");

  const documentData = await api.documentRouter.getEmployeeDocuments({
    id: params.documentId,
  });

  if (documentData === undefined) {
    return (
      <AdminMainWrapper>
        <Card className="h-fit flex-1">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Employee document with id - {params.documentId} was not found !!
            </CardTitle>
            <CardDescription>
              This can happen because of the following reasons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol>
              <li>
                Document may have been removed by other admin or someone with
                appropriate access control.
              </li>
              <li>This may be a shared url and it might be incorrect.</li>
            </ol>
          </CardContent>
        </Card>
      </AdminMainWrapper>
    );
  }

  return (
    <AdminMainWrapper>
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Update document data
          </CardTitle>
          <CardDescription>
            Updating {documentData.employee.name.split(" ").slice(0, 1)}&apos;s
            &nbsp;{documentData.documentType.type} data, to update document
            files drag and drop to upload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateEmployeeDocumentForm documentData={documentData} />
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
