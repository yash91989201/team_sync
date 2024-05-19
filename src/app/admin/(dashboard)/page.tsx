import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { startOfMonth } from "date-fns";
// UTILS
import { authPage } from "@/server/helpers";
import { createApiHelper } from "@/trpc/server";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@adminLayouts/admin-main-wrapper";
import StatsSection from "@adminComponents/dashboard/stats-section";
import HolidaySection from "@adminComponents/dashboard/holiday-section";
import { PayrollSection } from "@adminComponents/dashboard/payroll-section";
import { EmpShiftSection } from "@adminComponents/dashboard/emp-shift-section";
import { EmpLeaveSection } from "@adminComponents/dashboard/emp-leave-section";
import { AttendanceSection } from "@adminComponents/dashboard/attendance-section";
import { MissingDocsSection } from "@adminComponents/dashboard/missing-docs-section";

export default async function AdminPage() {
  await authPage("ADMIN");

  const date = new Date();
  date.setHours(0, 0, 0, 0);

  // stats section
  const statsSectionHelper = await createApiHelper();
  await statsSectionHelper.statsRouter.adminCount.prefetch();
  await statsSectionHelper.statsRouter.empCount.prefetch();
  await statsSectionHelper.statsRouter.deptCount.prefetch();
  await statsSectionHelper.statsRouter.monthHolidays.prefetch();
  const statsSectionState = dehydrate(statsSectionHelper.queryClient);

  // attendance section
  const attendanceSectionHelper = await createApiHelper();
  await attendanceSectionHelper.statsRouter.empCountByJoiningDate.prefetch({
    date: date,
  });
  await attendanceSectionHelper.statsRouter.attendance.prefetch({
    date: date,
  });
  const attendanceSectionState = dehydrate(attendanceSectionHelper.queryClient);

  // emp leave section
  const empLeaveSectionHelper = await createApiHelper();
  await empLeaveSectionHelper.statsRouter.onLeaveEmps.prefetch();
  await empLeaveSectionHelper.statsRouter.pendingLeaveRequests.prefetch();
  const empLeaveSectionState = dehydrate(empLeaveSectionHelper.queryClient);

  // emp shift section
  const empShiftSectionHelper = await createApiHelper();
  await empShiftSectionHelper.statsRouter.attendanceByDate.prefetch({
    date,
    query: {
      shift: undefined,
    },
  });
  const empShiftSectionState = dehydrate(empShiftSectionHelper.queryClient);

  // missing docs section
  const missingDocsSectionHelper = await createApiHelper();
  await missingDocsSectionHelper.statsRouter.missingEmpDocs.prefetch();
  const missingDocsSectionState = dehydrate(
    missingDocsSectionHelper.queryClient,
  );

  // payroll section
  const payrollSectionHelper = await createApiHelper();
  await payrollSectionHelper.statsRouter.employeesPayslip.prefetch({
    month: startOfMonth(date),
  });
  const payrollSectionState = dehydrate(payrollSectionHelper.queryClient);

  return (
    <AdminMainWrapper className="space-y-6">
      {/* section 1 */}
      <HydrationBoundary state={statsSectionState}>
        <StatsSection />
      </HydrationBoundary>

      {/* section 2 */}
      <HydrationBoundary state={attendanceSectionState}>
        <AttendanceSection />
      </HydrationBoundary>

      {/* section 3 */}
      <HydrationBoundary state={empLeaveSectionState}>
        <EmpLeaveSection />
      </HydrationBoundary>

      {/* section 4 */}
      <HydrationBoundary state={empShiftSectionState}>
        <EmpShiftSection />
      </HydrationBoundary>

      {/* section 5 */}
      <HydrationBoundary state={missingDocsSectionState}>
        <MissingDocsSection />
      </HydrationBoundary>

      {/* section 6 */}
      <HydrationBoundary state={payrollSectionState}>
        <PayrollSection />
      </HydrationBoundary>

      {/* section 7 */}
      <HolidaySection />
    </AdminMainWrapper>
  );
}
