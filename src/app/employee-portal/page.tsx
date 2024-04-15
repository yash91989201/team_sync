// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import GreetingHeader from "@/components/employee/greeting-header";
import AttendancePunchCard from "@/components/employee/attendance-punch-card";

export default async function EmployeePortalPage() {
  await authPage("EMPLOYEE");

  return (
    <>
      <GreetingHeader />
      <AttendancePunchCard />
    </>
  );
}
