// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import GreetingHeader from "@/components/employee/greeting-header";
import AttendancePunchCard from "@/components/employee/attendance-punch-card";
import EmployeeMainWrapper from "@/components/employee/employee-main-wrapper";
import UpcomingHolidays, {
  UpcomingHolidaysSkeleton,
} from "@/components/employee/upcoming-holidays";
import { Suspense } from "react";

export default async function EmployeePortalPage() {
  await authPage("EMPLOYEE");

  return (
    <EmployeeMainWrapper>
      <GreetingHeader />
      <AttendancePunchCard />
      <Suspense fallback={<UpcomingHolidaysSkeleton />}>
        <UpcomingHolidays />
      </Suspense>
    </EmployeeMainWrapper>
  );
}
