import { Suspense } from "react";
// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import {
  UpcomingHolidays,
  UpcomingHolidaysSkeleton,
} from "@empComponents/home/upcoming-holidays";
import GreetingHeader from "@empComponents/home/greeting-header";
import EmployeeMainWrapper from "@empLayouts/employee-main-wrapper";
import AttendancePunchCard from "@empComponents/home/attendance-punch-card";

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
