import { api } from "@/trpc/react";
// UI
import { Button } from "@ui/button";
// ICONS
import { Loader2, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

export function EmployeeTableActions({ empId }: { empId: string }) {
  const { refetch: refetchEmployees } = api.employeeRouter.getAll.useQuery();

  const { mutateAsync: deleteEmployee, isPending: isDeleting } =
    api.employeeRouter.deleteEmployee.useMutation();

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
      <Button
        variant="outline"
        size="icon"
        className="text-blue rounded-xl border-blue-500 text-blue-500 hover:border-blue-500 hover:bg-white hover:text-blue-500"
      >
        <Pencil className="size-4" />
      </Button>
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
