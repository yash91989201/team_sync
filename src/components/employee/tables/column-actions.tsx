import { toast } from "sonner";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { LeaveRequestSchemaType } from "@/lib/types";
// UI
import { Button } from "@/components/ui/button";
// ICONS
import { CircleOff, Loader2 } from "lucide-react";

export function LeaveApplicationTableActions({
  id,
  status,
}: {
  id: string;
  status: LeaveRequestSchemaType["status"];
}) {
  const { refetch: refetchLeaveApplications } =
    api.employeeRouter.getLeaveApplications.useQuery();
  const { mutateAsync: leaveWithdraw, isPending } =
    api.employeeRouter.leaveWithdraw.useMutation();

  const leaveWithdrawAction = async () => {
    const actionResponse = await leaveWithdraw({ leaveRequestId: id });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchLeaveApplications();
    } else {
      toast.error(actionResponse.message);
    }
  };

  if (status !== "pending") return null;

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isPending}
      onClick={leaveWithdrawAction}
      className="rounded-xl border-red-500 text-red-500 hover:border-red-500 hover:bg-white hover:text-red-500 [&>svg]:size-4"
    >
      {isPending ? <Loader2 /> : <CircleOff />}
    </Button>
  );
}
