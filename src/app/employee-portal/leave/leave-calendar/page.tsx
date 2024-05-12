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
import LeaveCalendar from "@empComponents/leave/leave-calendar";
import EmployeeMainWrapper from "@empComponents/layouts/employee-main-wrapper";

export default async function LeaveCalendarpage() {
  await authPage("EMPLOYEE");

  const apiHelper = await createApiHelper();
  await apiHelper.employeeRouter.getLeaveApplications.prefetch();
  const leaveApplications = dehydrate(apiHelper.queryClient);

  return (
    <EmployeeMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Leave calendar
          </CardTitle>
          <CardDescription>your leave calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={leaveApplications}>
            <LeaveCalendar />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </EmployeeMainWrapper>
  );
}
