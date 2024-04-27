"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
// SCHEMAS
import { UpdateDesignationSchema } from "@/lib/schema";
// TYPES
import type { UpdateDesignationchemaType } from "@/lib/types";
import type { SubmitHandler } from "react-hook-form";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UI
import { Button } from "@ui/button";
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
// ICONS
import { Loader2, Pencil } from "lucide-react";

export default function UpdateDesignationForm({
  initialData,
}: {
  initialData: UpdateDesignationchemaType;
}) {
  const dialog = useToggle(false);
  const updateDesignationForm = useForm<UpdateDesignationchemaType>({
    defaultValues: initialData,
    resolver: zodResolver(UpdateDesignationSchema),
  });

  const { control, handleSubmit, formState, reset } = updateDesignationForm;

  const { refetch: refetchDesignations } =
    api.designationRouter.getAll.useQuery();

  const { mutateAsync: updateDesignation } =
    api.designationRouter.updateDesignation.useMutation();

  const updateDepartmentAction: SubmitHandler<
    UpdateDesignationchemaType
  > = async (formData) => {
    await updateDesignation(formData);
    reset(formData);
    toast.success("Department updated successfully");
    dialog.close();
    await refetchDesignations();
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
        <Form {...updateDesignationForm}>
          <form
            onSubmit={handleSubmit(updateDepartmentAction)}
            className="space-y-3"
          >
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation Name</FormLabel>
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
              <span>Update Designation</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
