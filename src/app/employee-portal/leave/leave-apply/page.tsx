import LeaveApplyForm from "@/components/employee/leave-apply-form";
import { api } from "@/trpc/server";

export default async function LeaveApplyPage() {
  const leaveTypes = await api.leaveRouter.getLeaveTypes();
  return (
    <>
      <LeaveApplyForm leaveTypes={leaveTypes} />
    </>
  );
}
