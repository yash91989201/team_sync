import LeaveRequestList from "@/components/admin/leave/leave-request-list";
import { api } from "@/trpc/server";

export default async function LeaveRequestsPage() {
  const leaveRequests = await api.leaveRouter.getAllLeaveRequests();

  return <LeaveRequestList leaveRequests={leaveRequests} />;
}
