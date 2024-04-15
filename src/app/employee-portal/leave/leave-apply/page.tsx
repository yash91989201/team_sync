// UTILS
import { api } from "@/trpc/server";
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import LeaveApplyForm from "@/components/employee/leave-apply-form";

export default async function LeaveApplyPage() {
  await authPage("EMPLOYEE");
  const leaveTypes = await api.leaveRouter.getLeaveTypes();
  return (
    <>
      <LeaveApplyForm leaveTypes={leaveTypes} />
    </>
  );
}
