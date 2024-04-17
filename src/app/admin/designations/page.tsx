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
import DesignationTable from "@/components/admin/designation/designation-table";
import CreateDesignationForm from "@/components/admin/designation/create-designation-form";

export default async function DepartmentsPage() {
  await authPage("ADMIN");

  const designations = await api.designationRouter.getAll();

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            All designations
          </CardTitle>
          <CardDescription>
            Types of designations employee can have
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DesignationTable initialData={designations} />
        </CardContent>
      </Card>
      <CreateDesignationForm />
    </AdminMainWrapper>
  );
}
