// UTILS
import { api } from "@/trpc/server";
// CUSTOM COMPONENTS
import LeaveRequestList from "@/components/admin/leave/leave-request-list";

export default async function LeaveRequestsPage() {
  const leaveRequests = await api.leaveRouter.getAllLeaveRequests();

  return <LeaveRequestList leaveRequests={leaveRequests} />;
}
