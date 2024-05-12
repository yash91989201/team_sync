import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { authPage } from "@/server/helpers";
import { api, createApiHelper } from "@/trpc/server";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// CUSTOM COMPONENTS
import { LeaveApplicationTable } from "@empComponents/tables";
import LeaveApplyForm from "@empComponents/leave/leave-apply-form";
import EmployeeMainWrapper from "@empComponents/layouts/employee-main-wrapper";

export default async function LeaveApplyPage() {
  await authPage("EMPLOYEE");

  const leaveTypes = await api.employeeRouter.getLeaveTypes();
  const apiHelper = await createApiHelper();
  await apiHelper.employeeRouter.getLeaveApplications.prefetch();
  const leaveApplications = dehydrate(apiHelper.queryClient);

  return (
    <EmployeeMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Leave applications
          </CardTitle>
          <CardDescription>your leave applications</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={leaveApplications}>
            <LeaveApplicationTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
      <LeaveApplyForm leaveTypes={leaveTypes} />
    </EmployeeMainWrapper>
  );
}
