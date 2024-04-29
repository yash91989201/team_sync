"use client";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateId } from "lucia";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// SCHEMAS
import { CreateHolidaySchema } from "@/lib/schema";
// TYPES
import type { CreateHolidaySchemaType } from "@/lib/types";
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
import { CalendarIcon, Loader2, Plus } from "lucide-react";

export default function CreateHolidayForm() {
  const currentDate = new Date();

  const createHolidayForm = useForm<CreateHolidaySchemaType>({
    resolver: zodResolver(CreateHolidaySchema),
    defaultValues: {
      id: generateId(15),
      name: "",
    },
  });

  const { control, handleSubmit, formState, reset } = createHolidayForm;

  const { refetch: refetchHolidays } = api.holidayRouter.getAll.useQuery();

  const { mutateAsync: createNew } = api.holidayRouter.createNew.useMutation();

  const createHolidayAction: SubmitHandler<CreateHolidaySchemaType> = async (
    formData,
  ) => {
    const actionResponse = await createNew(formData);
    if (actionResponse.status === "SUCCESS") {
      reset({
        id: generateId(15),
      });
      await refetchHolidays();
      toast.success(actionResponse.message);
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <Plus className="size-4" />
          <span>Holiday</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New holiday</DialogTitle>
        </DialogHeader>
        <Form {...createHolidayForm}>
          <form
            onSubmit={handleSubmit(createHolidayAction)}
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
                          selected={field.value}
                          disabled={(date) => date <= currentDate}
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
              <span>Add holiday</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
