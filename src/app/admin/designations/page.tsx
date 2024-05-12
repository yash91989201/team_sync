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
import { DesignationTable } from "@adminComponents/tables";
import AdminMainWrapper from "@adminComponents/layouts/admin-main-wrapper";
import CreateDesignationForm from "@adminComponents/designation/create-designation-form";

export default async function DepartmentsPage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.designationRouter.getAll.prefetch();
  const designations = dehydrate(apiHelper.queryClient);

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
          <HydrationBoundary state={designations}>
            <DesignationTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
      <CreateDesignationForm />
    </AdminMainWrapper>
  );
}
