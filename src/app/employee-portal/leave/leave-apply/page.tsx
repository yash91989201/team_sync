import LeaveApplyForm from "@/components/employee/leave-apply-form";
import { api } from "@/trpc/server";

export default async function LeaveApplyPage() {
  const employeeLeaveBalances = await api.leaveRouter.getLeaveBalance();
  return (
    <>
      <LeaveApplyForm leaveBalances={employeeLeaveBalances} />
    </>
  );
}
