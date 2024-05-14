// UTILS
import { authPage } from "@/server/helpers";
import { createApiHelper } from "@/trpc/server";
// CUSTOM COMPONENTS
import { AttendanceSection } from "@adminComponents/dashboard/attendance-section";
import AdminMainWrapper from "@adminLayouts/admin-main-wrapper";
import { EmpLeaveSection } from "@/components/admin/dashboard/emp-leave-section";
import StatsSection from "@/components/admin/dashboard/stats-section";
import { EmpShiftSection } from "@/components/admin/dashboard/emp-shift-section";
import { MissingDocsSection } from "@/components/admin/dashboard/missing-docs-section";
import { PayrollSection } from "@/components/admin/dashboard/payroll-section";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

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
  await attendanceSectionHelper.statsRouter.empCountByJoinDate.prefetch({
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
    date: date,
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
    month: date,
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
    </AdminMainWrapper>
  );
}
