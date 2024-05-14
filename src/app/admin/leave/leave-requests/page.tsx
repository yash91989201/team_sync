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
import AdminMainWrapper from "@adminComponents/layouts/admin-main-wrapper";
import LeaveRequestsTable from "@adminComponents/leave/leave-requests-table";

export default async function LeaveRequestsPage() {
  await authPage("ADMIN");

  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const apiHelper = await createApiHelper();
  await apiHelper.leaveRouter.getLeaveRequests.prefetch({
    month: date,
    status: undefined,
    employeeName: undefined,
  });
  const leaveRequests = dehydrate(apiHelper.queryClient);

  return (
    <AdminMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Leave requests
          </CardTitle>
          <CardDescription>
            leave requests made by all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={leaveRequests}>
            <LeaveRequestsTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
