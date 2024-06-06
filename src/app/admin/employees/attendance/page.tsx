import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { startOfMonth } from "date-fns";
import { createApiHelper } from "@/trpc/server";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@adminLayouts/admin-main-wrapper";
import DailyAttendanceTable from "@adminComponents/employee/attendance/daily-attendance-table";
import MonthlyAttendanceTable from "@adminComponents/employee/attendance/monthly-attendance-table";
import EmployeeAttendanceTable from "@adminComponents/employee/attendance/employee-attendance-table";

export default async function AttendancePage({
  searchParams,
}: {
  // eslint-disable-next-line
  searchParams: { [key: string]: string | undefined };
}) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const paramPeriod = searchParams?.period ?? "";

  const attendanceHelper = await createApiHelper();
  await attendanceHelper.statsRouter.attendanceByDate.prefetch({
    date,
    query: {
      shift: undefined,
      employeeName: undefined,
    },
  });
  await attendanceHelper.statsRouter.attendanceByMonth.prefetch({
    month: startOfMonth(date),
    name: "",
  });
  const attendanceState = dehydrate(attendanceHelper.queryClient);

  const defaultTab = ["month", "day"].includes(paramPeriod)
    ? paramPeriod
    : "month";

  return (
    <AdminMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Employees Attendance
          </CardTitle>
          <CardDescription>
            check employees attendance monthly/daily
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={attendanceState}>
            <Tabs defaultValue={defaultTab}>
              <TabsList>
                <TabsTrigger value="month">Monthly</TabsTrigger>
                <TabsTrigger value="day">Daily</TabsTrigger>
                <TabsTrigger value="employee">By Employee</TabsTrigger>
              </TabsList>
              <TabsContent value="month">
                <MonthlyAttendanceTable />
              </TabsContent>
              <TabsContent value="day">
                <DailyAttendanceTable />
              </TabsContent>
              <TabsContent value="employee">
                <EmployeeAttendanceTable />
              </TabsContent>
            </Tabs>
          </HydrationBoundary>
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
