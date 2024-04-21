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
} from "@ui/card";
// CUSTOM COMPONENTS
import { LeaveBalancesTable } from "@/components/employee/tables";
import EmployeeMainWrapper from "@/components/employee/employee-main-wrapper";

export default async function LeaveBalancesPage() {
  await authPage("EMPLOYEE");

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
