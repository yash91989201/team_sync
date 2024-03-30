import LeaveApplyForm from "@/components/employee/leave-apply-form";
import { api } from "@/trpc/server";

export default async function LeaveApplyPage() {
  const employeeProfile = await api.employeeRouter.getProfile();
  return (
    <>
      <LeaveApplyForm paidLeaveDays={employeeProfile.paidLeaves} />
    </>
  );
}
