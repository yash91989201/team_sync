import Link from "next/link";
import { toast } from "sonner";
// UITLS
import { api } from "@/trpc/react";
// UI
import { Button, buttonVariants } from "@ui/button";
// ICONS
import { Loader2, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

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
