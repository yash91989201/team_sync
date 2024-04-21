import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { api } from "@/trpc/server";
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
import LeaveApplyForm from "@/components/employee/leave/leave-apply-form";
import EmployeeMainWrapper from "@/components/employee/employee-main-wrapper";
import LeaveApplicationTable from "@/components/employee/leave/leave-application-table";

export default async function LeaveApplyPage() {
  await authPage("EMPLOYEE");

  const leaveTypes = await api.employeeRouter.getLeaveTypes();
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
