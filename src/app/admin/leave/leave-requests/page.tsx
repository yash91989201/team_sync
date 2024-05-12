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
import { LeaveRequestsTable } from "@/components/admin/tables";
import AdminMainWrapper from "@/components/admin/layout/admin-main-wrapper";

export default async function LeaveRequestsPage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.leaveRouter.getAllLeaveRequests.prefetch();
  const allLeaveRequests = dehydrate(apiHelper.queryClient);

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
          <HydrationBoundary state={allLeaveRequests}>
            <LeaveRequestsTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
