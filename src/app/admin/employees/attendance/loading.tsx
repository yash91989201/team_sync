// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@adminLayouts/admin-main-wrapper";
import { DailyAttendanceTableSkeleton } from "@adminComponents/employee/attendance/daily-attendance-table";
import { MonthlyAttendanceTableSkeleton } from "@adminComponents/employee/attendance/monthly-attendance-table";

export default async function AttendanceLoading() {
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
          <Tabs defaultValue="month">
            <TabsList>
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="day">Daily</TabsTrigger>
            </TabsList>
            <TabsContent value="month">
              <MonthlyAttendanceTableSkeleton />
            </TabsContent>
            <TabsContent value="day">
              <DailyAttendanceTableSkeleton />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
