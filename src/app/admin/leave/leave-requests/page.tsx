// UTILS
import { authPage } from "@/server/helpers";
import { api } from "@/trpc/server";
// CUSTOM COMPONENTS
import LeaveRequestList from "@/components/admin/leave/leave-request-list";

export default async function LeaveRequestsPage() {
  await authPage("ADMIN");
  const leaveRequests = await api.leaveRouter.getAllLeaveRequests();

  return <LeaveRequestList leaveRequests={leaveRequests} />;
}
