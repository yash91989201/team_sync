import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { authPage } from "@/server/helpers";
import { createApiHelper } from "@/trpc/server";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// CUSTOM COMPONENTS
import { SalariesTable } from "@/components/admin/tables";
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";

export default async function SalariesPage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.adminRouter.getEmployeesSalaries.prefetch();
  const employeesSalaries = dehydrate(apiHelper.queryClient);

  return (
    <AdminMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Employees Salaries
          </CardTitle>
          <CardDescription>salaries of employees</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={employeesSalaries}>
            <SalariesTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
