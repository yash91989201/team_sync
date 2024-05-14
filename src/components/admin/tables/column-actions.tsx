import Link from "next/link";
import { toast } from "sonner";
// UITLS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { buttonVariants } from "@ui/button";
import { deleteEmployeeDocumentFiles } from "@/lib/pb-utils";
// TYPES
import type { LeaveRequestSchemaType } from "@/lib/types";
// UI
import { Button } from "@ui/button";
// CUSTOM COMPONENTS
import UpdateLeaveTypeForm from "@adminComponents/leave/update-leave-type-form";
import DeleteLeaveTypeForm from "@adminComponents/leave/delete-leave-type-form";
import UpdateDepartmentForm from "@adminComponents/department/update-department-form";
import UpdateDesignationForm from "@adminComponents/designation/update-designation-form";
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

export function LeaveTypeTableActions(initialData: {
  id: string;
  type: string;
}) {
  return (
    <div className="space-x-1">
      <UpdateLeaveTypeForm initialData={initialData} />
      <DeleteLeaveTypeForm id={initialData.id} type={initialData.type} />
    </div>
  );
}

export function LeaveRequestsTableActions({
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
        onClick={() => rejectLeave({ leaveRequestId })}
        disabled={isRejectingLeave || isApprovingLeave}
      >
        {isRejectingLeave ? <Loader2 className="animate-spin" /> : <X />}
      </Button>
    </div>
  );
}

export function DepartmentTableActions(initialData: {
  id: string;
  name: string;
}) {
  const { refetch: refetchDepartments } =
    api.departmentRouter.getAll.useQuery();

  const { mutateAsync: deleteDepartment, isPending: isDeleting } =
    api.departmentRouter.deleteDepartment.useMutation();

  const deleteDepartmentAction = async () => {
    const actionResponse = await deleteDepartment({ id: initialData.id });
    if (actionResponse.status === "SUCCESS") {
      await refetchDepartments();
      toast.success(actionResponse.message);
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <div className="space-x-1.5">
      <UpdateDepartmentForm initialData={initialData} />
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

export function DesignationTableActions(initialData: {
  id: string;
  name: string;
  deptId: string;
}) {
  const { refetch: refetchDesignations } =
    api.designationRouter.getAll.useQuery();

  const { mutateAsync: deleteDesignation, isPending: isDeleting } =
    api.designationRouter.deleteDesignation.useMutation();

  const deleteDesignationAction = async () => {
    const actionResponse = await deleteDesignation({
      id: initialData.id,
      deptId: initialData.deptId,
    });
    if (actionResponse.status === "SUCCESS") {
      await refetchDesignations();
      toast.success(actionResponse.message);
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <div className="space-x-1.5">
      <UpdateDesignationForm initialData={initialData} />
      <Button
        variant="outline"
        size="icon"
        disabled={isDeleting}
        onClick={deleteDesignationAction}
        className="rounded-xl border-red-500 text-red-500 hover:border-red-500 hover:bg-white hover:text-red-500 [&>svg]:size-4"
      >
        {isDeleting ? <Loader2 /> : <Trash />}
      </Button>
    </div>
  );
}

export function EmployeesDocumentsTableActions({
  id,
  filesId,
}: {
  id: string;
  filesId: string[];
}) {
  const { refetch: refetchEmployeesDocuments } =
    api.documentRouter.getEmployeesDocuments.useQuery();

  const { mutateAsync: deleteEmployeeDocument, isPending: isDeleting } =
    api.documentRouter.deleteEmployeeDocument.useMutation();

  const deleteEmployeeDocumentAction = async () => {
    const deleteFilesResponse = await deleteEmployeeDocumentFiles(filesId);

    if (deleteFilesResponse.status === "FAILED") {
      toast.error(deleteFilesResponse.message);
      return;
    }

    const actionResponse = await deleteEmployeeDocument({ id, filesId });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchEmployeesDocuments();
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <div className="space-x-1.5">
      <Link
        href={`/admin/document-center/employee-documents/${id}/update-document`}
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
        onClick={deleteEmployeeDocumentAction}
      >
        {isDeleting ? <Loader2 /> : <Trash />}
      </Button>
    </div>
  );
}

export function SalariesTableActions({ empId }: { empId: string }) {
  return (
    <Link
      href={`/admin/employees/${empId}/update-employee?sections=salary_detail`}
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
  );
}
