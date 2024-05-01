import { Suspense } from "react";
// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import UpcomingHolidays, {
  UpcomingHolidaysSkeleton,
} from "@/components/employee/upcoming-holidays";
import GreetingHeader from "@/components/employee/greeting-header";
import AttendancePunchCard from "@/components/employee/attendance-punch-card";
import EmployeeMainWrapper from "@/components/employee/employee-main-wrapper";

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
