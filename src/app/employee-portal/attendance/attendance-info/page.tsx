// UTILS
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
import EmployeeMainWrapper from "@empComponents/layouts/employee-main-wrapper";
import AttendanceCalendar from "@empComponents/attendance-info/attendance-calendar";

export default async function AttendanceInfoPage() {
  await authPage("EMPLOYEE");

  return (
    <EmployeeMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Attendance Info
          </CardTitle>
          <CardDescription>attendance info with shift timing</CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceCalendar />
        </CardContent>
      </Card>
    </EmployeeMainWrapper>
  );
}
