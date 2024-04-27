import Link from "next/link";
import { toast } from "sonner";
// UITLS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { buttonVariants } from "@ui/button";
// TYPES
import type { LeaveRequestSchemaType } from "@/lib/types";
// UI
import { Button } from "@ui/button";
// CUSTOM COMPONENTS
import UpdateDepartmentForm from "@/components/admin/department/update-department-form";
// ICONS
import { Check, Loader2, Pencil, Trash, X } from "lucide-react";

export function EmployeeTableActions({ empId }: { empId: string }) {
  const { refetch: refetchEmployees } = api.employeeRouter.getAll.useQuery();

  const { mutateAsync: deleteEmployee, isPending: isDeleting } =
    api.adminRouter.deleteEmployee.useMutation();

  const deleteEmployeeAction = async () => {
    const actionResponse = await deleteEmployee({ empId });

    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchEmployees();
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <div className="space-x-1.5">
      <Link
        href={`/admin/employees/${empId}/update-employee`}
        className={cn(
          buttonVariants({
            size: "icon",
            variant: "outline",
            className:
              "rounded-xl  text-blue-500  hover:border-blue-500 hover:bg-white hover:text-blue-500",
          }),
          "border-blue-500 ",
        )}
      >
        <Pencil className="size-4" />
      </Link>
      <Button
        variant="outline"
        size="icon"
        className="rounded-xl border-red-500 text-red-500 hover:border-red-500 hover:bg-white hover:text-red-500 [&>svg]:size-4"
        disabled={isDeleting}
        onClick={deleteEmployeeAction}
      >
        {isDeleting ? <Loader2 /> : <Trash />}
      </Button>
    </div>
  );
}

export function LeaveTypeTableActions({ id }: { id: string }) {
  const { refetch: refetchLeaveTypes } =
    api.leaveRouter.getLeaveTypes.useQuery();
  const { mutateAsync: deleteLeaveType, isPending } =
    api.leaveRouter.deleteLeaveType.useMutation();

  const deleteLeaveTypeAction = async () => {
    await deleteLeaveType({ id });
    toast.success("Deleted leave type successfully");
    await refetchLeaveTypes();
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-xl border-red-500 text-red-500 hover:border-red-500 hover:bg-white hover:text-red-500 [&>svg]:size-4"
      disabled={isPending}
      onClick={deleteLeaveTypeAction}
    >
      {isPending ? <Loader2 /> : <Trash />}
    </Button>
  );
}

export function LeaveRequestsTableActions({
  empId,
  status,
  leaveRequestId,
}: {
  empId: string;
  leaveRequestId: string;
  status: LeaveRequestSchemaType["status"];
}) {
  const { refetch: refetchAllLeaveRequests } =
    api.leaveRouter.getAllLeaveRequests.useQuery();

  const { mutate: rejectLeave, isPending: isRejectingLeave } =
    api.leaveRouter.rejectLeave.useMutation({
      onSuccess: async () => {
        await refetchAllLeaveRequests();
      },
    });

  const { mutate: approveLeave, isPending: isApprovingLeave } =
    api.leaveRouter.approveLeave.useMutation({
      onSuccess: async () => {
        await refetchAllLeaveRequests();
      },
    });

  if (status !== "pending") return "N/A";

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="rounded-xl border-green-500  text-green-500 hover:bg-white hover:text-green-500 [&>svg]:size-4"
        onClick={() => approveLeave({ leaveRequestId })}
        disabled={isRejectingLeave || isApprovingLeave}
      >
        {isApprovingLeave ? <Loader2 className="animate-spin" /> : <Check />}
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="rounded-xl border-red-500  text-red-500 hover:bg-white hover:text-red-500 [&>svg]:size-4"
        onClick={() => rejectLeave({ empId, leaveRequestId })}
        disabled={isRejectingLeave || isApprovingLeave}
      >
        {isRejectingLeave ? <Loader2 className="animate-spin" /> : <X />}
      </Button>
    </div>
  );
}

export function DepartmentTableActions({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const { refetch: refetchDepartments } =
    api.departmentRouter.getAll.useQuery();

  const { mutateAsync: deleteDepartment, isPending: isDeleting } =
    api.departmentRouter.deleteDepartment.useMutation();

  const deleteDepartmentAction = async () => {
    const actionResponse = await deleteDepartment({ id });
    if (actionResponse.status === "SUCCESS") {
      await refetchDepartments();
      toast.success(actionResponse.message);
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <div className="space-x-1.5">
      <UpdateDepartmentForm initialData={{ id, name }} />
      <Button
        variant="outline"
        size="icon"
        disabled={isDeleting}
        onClick={deleteDepartmentAction}
        className="rounded-xl border-red-500 text-red-500 hover:border-red-500 hover:bg-white hover:text-red-500 [&>svg]:size-4"
      >
        {isDeleting ? <Loader2 /> : <Trash />}
      </Button>
    </div>
  );
}
