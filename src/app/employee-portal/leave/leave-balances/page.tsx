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
} from "@ui/card";
// CUSTOM COMPONENTS
import { LeaveBalancesTable } from "@empComponents/tables";
import EmployeeMainWrapper from "@empComponents/layouts/employee-main-wrapper";

export default async function LeaveBalancesPage() {
  await authPage("EMPLOYEE");

  const apiHelper = await createApiHelper();
  await apiHelper.leaveRouter.getLeaveBalances.prefetch();
  const leaveBalances = dehydrate(apiHelper.queryClient);

  return (
    <EmployeeMainWrapper>
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Leave Balances
          </CardTitle>
          <CardDescription>available leave balances</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={leaveBalances}>
            <LeaveBalancesTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </EmployeeMainWrapper>
  );
}
