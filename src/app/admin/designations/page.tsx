import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { apiHelper } from "@/trpc/helpers";
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
import { DesignationTable } from "@/components/admin/tables";
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import CreateDesignationForm from "@/components/admin/designation/create-designation-form";

export default async function DepartmentsPage() {
  await authPage("ADMIN");

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
