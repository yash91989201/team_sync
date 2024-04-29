"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
// SCHEMAS
import { UpdateDepartmentSchema } from "@/lib/schema";
// TYPES
import type {
  DepartmentSchemaType,
  UpdateDepartmentSchemaType,
} from "@/lib/types";
import type { SubmitHandler } from "react-hook-form";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
// ICONS
import { Loader2, Pencil } from "lucide-react";

export default function UpdateDepartmentForm({
  initialData,
}: {
  initialData: DepartmentSchemaType;
}) {
  const dialog = useToggle(false);
  const updateDepartmentForm = useForm<UpdateDepartmentSchemaType>({
    defaultValues: initialData,
    resolver: zodResolver(UpdateDepartmentSchema),
  });

  const { control, handleSubmit, formState, reset } = updateDepartmentForm;

  const { refetch: refetchDepartments } =
    api.departmentRouter.getAll.useQuery();

  const { mutateAsync: updateDepartment } =
    api.departmentRouter.updateDepartment.useMutation();

  const updateDepartmentAction: SubmitHandler<
    UpdateDepartmentSchemaType
  > = async (formData) => {
    await updateDepartment(formData);
    reset(formData);
    toast.success("Department updated successfully");
    dialog.close();
    await refetchDepartments();
  };

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.toggle}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-blue-500 text-blue-500 hover:border-blue-500 hover:bg-white hover:text-blue-500 [&>svg]:size-4"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update department</DialogTitle>
        </DialogHeader>
        <Form {...updateDepartmentForm}>
          <form
            onSubmit={handleSubmit(updateDepartmentAction)}
            className="space-y-3"
          >
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter department name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={formState.isSubmitting}>
              {formState.isSubmitting && (
                <Loader2 className="mr-3 animate-spin" />
              )}
              <span>Update Department</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
