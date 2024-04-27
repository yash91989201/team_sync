"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { format, startOfYear } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// SCHEMAS
import { CreateHolidaySchema } from "@/lib/schema";
// TYPES
import type {
  CreateHolidaySchemaType,
  UpdateHolidaySchemaType,
} from "@/lib/types";
import type { SubmitHandler } from "react-hook-form";
// UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";
import { Button } from "@ui/button";
import { Calendar } from "@ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// ICONS
import { CalendarIcon, Loader2, Pencil } from "lucide-react";
import useToggle from "@/hooks/use-toggle";

export default function UpdateHolidayForm({
  holiday,
}: {
  holiday: UpdateHolidaySchemaType;
}) {
  const firstDayOfYear = startOfYear(new Date());
  const dialog = useToggle(false);

  const updateHolidayForm = useForm<CreateHolidaySchemaType>({
    resolver: zodResolver(CreateHolidaySchema),
    defaultValues: holiday,
  });

  const { control, handleSubmit, formState, reset } = updateHolidayForm;

  const { refetch: refetchHolidays } = api.holidayRouter.getAll.useQuery();

  const { mutateAsync: updateHoliday } =
    api.holidayRouter.updateHoliday.useMutation();

  const updateHolidayAction: SubmitHandler<CreateHolidaySchemaType> = async (
    formData,
  ) => {
    const actionResponse = await updateHoliday(formData);
    if (actionResponse.status === "SUCCESS") {
      reset(formData);
      await refetchHolidays();
      dialog.close();
      toast.success(actionResponse.message);
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.toggle}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-xl text-blue-500"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update holiday</DialogTitle>
        </DialogHeader>
        <Form {...updateHolidayForm}>
          <form
            onSubmit={handleSubmit(updateHolidayAction)}
            className="space-y-3"
          >
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holiday name</FormLabel>
                  <FormControl>
                    <Input placeholder="For ex. Diwali etc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holiday date</FormLabel>
                  <FormControl>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "LLL dd, y")
                          ) : (
                            <span>Pick holiday date</span>
                          )}
                          <span className="inline-flex items-center text-gray-600">
                            <CalendarIcon className="mr-1.5 size-4" />
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          fixedWeeks={true}
                          defaultMonth={field.value}
                          disabled={(date) => date < firstDayOfYear}
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <p className="text-sm text-red-500">
                    {!!formState.errors.date ? (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        Holiday start and end date is required.
                      </p>
                    ) : null}
                  </p>
                </FormItem>
              )}
            />

            <Button className="gap-1" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="animate-spin" />}
              <span>Update holiday</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
