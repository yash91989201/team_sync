"use client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LeaveApplySchema } from "@/lib/schema";
import type { LeaveApplySchemaType, LeaveTypeSchemaType } from "@/lib/types";
import { api } from "@/trpc/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

type LeaveApplyFormProps = {
  leaveBalances: LeaveTypeSchemaType[];
};

export default function LeaveApplyForm({ leaveBalances }: LeaveApplyFormProps) {
  const currentDate = new Date();
  // Add 1 day to the current date
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 1);

  const leaveApplyForm = useForm<LeaveApplySchemaType>({
    resolver: zodResolver(LeaveApplySchema),
    defaultValues: {
      leaveTypeId: "",
      leaveDate: {
        from: nextDay,
        to: nextDay,
      },
      leaveDays: 1,
      reason: "",
    },
  });

  const { control, handleSubmit, setValue, formState, watch } = leaveApplyForm;
  const { data: leaveReviewers = [] } =
    api.leaveRouter.getLeaveReviewers.useQuery();

  const { mutate: leaveApply } = api.employeeRouter.leaveApply.useMutation();

  const leaveApplyAction: SubmitHandler<LeaveApplySchemaType> = (formData) => {
    leaveApply(formData);
    toast.success("Applied for leave request");
  };

  const leaveTypeBalance = watch("daysAllowed");

  return (
    <Form {...leaveApplyForm}>
      <form onSubmit={handleSubmit(leaveApplyAction)}>
        <FormField
          control={control}
          name="leaveTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const selectedLeaveType = leaveBalances.find(
                    (leaveType) => leaveType.id === value,
                  )!;
                  setValue("daysAllowed", selectedLeaveType.daysAllowed);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a leave type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leaveBalances?.map((leaveType) => (
                    <SelectItem key={leaveType.id} value={leaveType.id}>
                      {leaveType.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="leaveDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Date</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y")} &minus;
                            {format(field.value.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick leave days</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={field.value}
                      disabled={(date) => date <= currentDate}
                      onSelect={(value) => {
                        field.onChange(value);
                        if (
                          value?.from !== undefined &&
                          value?.to !== undefined
                        ) {
                          const diffInMs =
                            value.to.getTime() - value.from.getTime();
                          const diffInDays = diffInMs / (24 * 60 * 60 * 1000);
                          const leaveDays = Math.round(diffInDays);
                          // add 1 to make from - to inclusive
                          setValue("leaveDays", leaveDays + 1);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              {!!formState.errors.leaveDate?.from?.message ||
                !!formState.errors.leaveDate?.to?.message ? (
                <p className="text-[0.8rem] font-medium text-destructive">
                  Leave start and end date is required.
                </p>
              ) : null}
            </FormItem>
          )}
        />
        <p>Leave Bal: {leaveTypeBalance}</p>
        <FormField
          control={control}
          name="leaveDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Days</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="hide-number-input-spinner w-16 bg-white"
                  readOnly={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="reviewerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Reviewer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Apply to" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leaveReviewers.map((reviewer) => (
                    <SelectItem key={reviewer.id} value={reviewer.id}>
                      <span>{reviewer.name}</span>
                      <Badge variant="outline" className="ml-3">
                        {reviewer.role}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Reason for leave (optional)"
                  className="resize-none bg-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={false}>Apply</Button>
      </form>
    </Form>
  );
}
