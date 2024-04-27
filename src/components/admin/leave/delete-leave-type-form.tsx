import { toast } from "sonner";
import { useState } from "react";
// UITLS
import { api } from "@/trpc/react";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UI
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@ui/button";
// ICONS
import { Input } from "@/components/ui/input";
import { Loader2, Trash } from "lucide-react";

export default function DeleteLeaveTypeForm({
  id,
  type,
}: {
  id: string;
  type: string;
}) {
  const dialog = useToggle(false);
  const [leaveType, setLeaveType] = useState("");

  const { refetch: refetchLeaveTypes } =
    api.leaveRouter.getLeaveTypes.useQuery();

  const { mutateAsync: deleteLeaveType, isPending } =
    api.leaveRouter.deleteLeaveType.useMutation();

  const deleteLeaveTypeAction = async () => {
    if (leaveType !== type) {
      return;
    }
    const actionResponse = await deleteLeaveType({ id });

    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchLeaveTypes();
      dialog.close();
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.toggle}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-red-500 text-red-500 hover:border-red-500 hover:bg-white hover:text-red-500 [&>svg]:size-4"
        >
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deleting &apos;{type}&apos; leave type ?</DialogTitle>
        </DialogHeader>
        <div className="my-3 space-y-3">
          <p className="text-sm font-medium text-red-500">
            Deleting a leave type will also delete employee leave balance and
            leave requests with this leave type. Do you still want to continue ?
          </p>
          <p className="text-sm text-gray-700">
            Enter leave type to confirm deletion.
          </p>
          <Input
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            placeholder="Enter leave type"
          />
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="secondary">No! back off</Button>
          </DialogTrigger>
          <Button
            variant="destructive"
            className="gap-1"
            disabled={isPending || leaveType !== type}
            onClick={deleteLeaveTypeAction}
          >
            {isPending ? <Loader2 /> : null}
            <span>Yes, continue</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
