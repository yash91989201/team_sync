// CUSTOM COMPONENTS
import AdminMainWrapper from "@/components/admin/layouts/admin-main-wrapper";
import { StatsSectionSkeleton } from "@/components/admin/dashboard/stats-section";
import { PayrollSectionSkeleton } from "@/components/admin/dashboard/payroll-section";
import { EmpShiftSectionSkeleton } from "@/components/admin/dashboard/emp-shift-section";
import { EmpLeavesSectionSkeleton } from "@/components/admin/dashboard/emp-leave-section";
import { AttendanceSectionSkeleton } from "@/components/admin/dashboard/attendance-section";
import { MissingDocsSectionSkeleton } from "@/components/admin/dashboard/missing-docs-section";

export default function AdminDashboardLoading() {
  return (
    <AdminMainWrapper className="space-y-6">
      {/* section 1 */}
      <StatsSectionSkeleton />
      {/* section 2 */}
      <AttendanceSectionSkeleton />
      {/* section 3 */}
      <EmpLeavesSectionSkeleton />
      {/* section 4 */}
      <EmpShiftSectionSkeleton />
      {/* section 5 */}
      <MissingDocsSectionSkeleton />
      {/* section 6 */}
      <PayrollSectionSkeleton />
    </AdminMainWrapper>
  );
}
