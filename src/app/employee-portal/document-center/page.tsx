import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { apiHelper } from "@/trpc/server";
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
import { EmployeeDocumentsTable } from "@/components/employee/tables";
import EmployeeMainWrapper from "@/components/employee/employee-main-wrapper";

export default async function DocumentCenterPage() {
  await authPage("EMPLOYEE");

  await apiHelper.employeeRouter.getDocuments.prefetch();
  const employeeDocuments = dehydrate(apiHelper.queryClient);

  return (
    <EmployeeMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Document Center
          </CardTitle>
          <CardDescription>your documents</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={employeeDocuments}>
            <EmployeeDocumentsTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </EmployeeMainWrapper>
  );
}
