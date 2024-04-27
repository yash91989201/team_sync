import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UITLS
import { api } from "@/trpc/react";
// SCHEMAS
import { UpdateLeaveTypeSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { UpdateLeaveTypeSchemaType } from "@/lib/types";
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

export default function UpdateLeaveTypeForm({
  initialData,
}: {
  initialData: {
    id: string;
    type: string;
  };
}) {
  const dialog = useToggle(false);

  const updateLeaveTypeForm = useForm<UpdateLeaveTypeSchemaType>({
    defaultValues: initialData,
    resolver: zodResolver(UpdateLeaveTypeSchema),
  });
  const { handleSubmit, formState, control } = updateLeaveTypeForm;

  const { refetch: refetchLeaveTypes } =
    api.leaveRouter.getLeaveTypes.useQuery();

  const { mutateAsync: updateLeaveType } =
    api.leaveRouter.updateLeaveType.useMutation();

  const updateLeaveTypeAction: SubmitHandler<
    UpdateLeaveTypeSchemaType
  > = async (formData) => {
    const actionResponse = await updateLeaveType(formData);
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
          className="rounded-xl border-blue-500 text-blue-500 hover:border-blue-500 hover:bg-white hover:text-blue-500 [&>svg]:size-4"
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update leave type</DialogTitle>
        </DialogHeader>
        <Form {...updateLeaveTypeForm}>
          <form
            onSubmit={handleSubmit(updateLeaveTypeAction)}
            className="space-y-3"
          >
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter leave type" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={formState.isSubmitting}>
              {formState.isSubmitting && (
                <Loader2 className="mr-3 animate-spin" />
              )}
              <span>Update leave type</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
