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
import { EmployeesTable } from "@adminComponents/tables";
import AdminMainWrapper from "@adminComponents/layouts/admin-main-wrapper";

export default async function EmployeePage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.employeeRouter.getAll.prefetch();
  const employeeList = dehydrate(apiHelper.queryClient);

  return (
    <AdminMainWrapper>
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Employee directory
          </CardTitle>
          <CardDescription>list of all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={employeeList}>
            <EmployeesTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
