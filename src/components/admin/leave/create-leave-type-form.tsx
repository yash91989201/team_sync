"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// SCHEMAS
import { CreateLeaveTypeSchema } from "@/lib/schema";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateLeaveTypeSchemaType } from "@/lib/types";
// UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateLeaveTypeForm() {
  const createLeaveTypeForm = useForm<CreateLeaveTypeSchemaType>({
    resolver: zodResolver(CreateLeaveTypeSchema),
    defaultValues: {
      type: "",
      daysAllowed: 5,
      renewPeriod: "month",
      renewPeriodCount: 1,
      carryOver: true,
    },
  });

  const { control, handleSubmit } = createLeaveTypeForm;
  const { mutateAsync: createLeaveType, isPending } =
    api.leaveRouter.createLeaveType.useMutation();

  const createLeaveTypeAction: SubmitHandler<
    CreateLeaveTypeSchemaType
  > = async (formData) => {
    await createLeaveType(formData);
  };

  return (
    <Form {...createLeaveTypeForm}>
      <form onSubmit={handleSubmit(createLeaveTypeAction)}>
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Type</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ex. Paid leave" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="daysAllowed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. of leave days</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="hide-number-input-spinner w-16"
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="renewPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renew Period</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Renew leave by this period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="renewPeriodCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renew Period Count</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="hide-number-input-spinner w-16"
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="carryOver"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                Leave carry over
              </FormLabel>
            </FormItem>
          )}
        />
        <Button disabled={isPending}>Add Leave type</Button>
      </form>
    </Form>
  );
}
