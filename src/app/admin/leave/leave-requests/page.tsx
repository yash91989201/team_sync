import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { authPage } from "@/server/helpers";
import { createApiHelper } from "@/trpc/server";
import { parseDate } from "@/lib/date-time-utils";
// TYPES
import type { LeaveReqStatusType } from "@/lib/types";
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
// CONSTANTS
import { LEAVE_STATUS } from "@/constants";

export default async function LeaveRequestsPage({
  searchParams,
}: {
  // eslint-disable-next-line
  searchParams: { [key: string]: string | undefined };
}) {
  await authPage("ADMIN");

  const paramDate = searchParams?.date ?? undefined;
  const paramStatus = searchParams?.status ?? undefined;
  const paramEmployee = searchParams?.employee ?? undefined;

  const initialDate =
    paramDate !== undefined ? parseDate(paramDate) : undefined;
  const initialStatus = LEAVE_STATUS.find((status) => status === paramStatus);
  const initialEmployee = paramEmployee;

  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const apiHelper = await createApiHelper();
  await apiHelper.leaveRouter.getLeaveRequests.prefetch({
    month: initialDate ?? date,
    status:
      initialStatus !== undefined
        ? (initialStatus as LeaveReqStatusType)
        : undefined,
    employeeName: initialEmployee ?? undefined,
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
