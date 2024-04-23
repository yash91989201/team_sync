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
import { DepartmentTable } from "@/components/admin/tables";
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import CreateDepartmentForm from "@/components/admin/department/create-department-form";

export default async function DepartmentsPage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.departmentRouter.getAll.prefetch();
  const departments = dehydrate(apiHelper.queryClient);

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            All departments
          </CardTitle>
          <CardDescription>
            Types of departments employee can belong to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={departments}>
            <DepartmentTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
      <CreateDepartmentForm />
    </AdminMainWrapper>
  );
}
