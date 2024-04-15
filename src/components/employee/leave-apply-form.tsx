"use client";
import { Calendar } from "@ui//calendar";
import { Button } from "@ui//button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui//form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ui//popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui//select";
import { LeaveApplySchema } from "@/lib/schema";
import type { LeaveApplySchemaType, LeaveTypeSchemaType } from "@/lib/types";
import { api } from "@/trpc/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@ui//textarea";
import { Badge } from "@ui//badge";
import { toast } from "sonner";

type LeaveApplyFormProps = {
  leaveTypes: LeaveTypeSchemaType[];
};

export default function LeaveApplyForm({ leaveTypes }: LeaveApplyFormProps) {
  const currentDate = new Date();
  // Add 1 day to the current date
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 1);

  const leaveApplyForm = useForm<LeaveApplySchemaType>({
    resolver: zodResolver(LeaveApplySchema),
    defaultValues: {
      leaveTypeId: "",
      reviewerId: "",
      reason: "",
    },
  });

  const { control, handleSubmit, setValue, formState, reset } = leaveApplyForm;
  const { data: leaveReviewers = [] } =
    api.leaveRouter.getLeaveReviewers.useQuery();

  const { mutateAsync: leaveApply, isPending } =
    api.employeeRouter.leaveApply.useMutation();

  const leaveApplyAction: SubmitHandler<LeaveApplySchemaType> = async (
    formData,
  ) => {
    const res = await leaveApply(formData);
    if (res.status === "SUCCESS") {
      reset();
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div>
      <Form {...leaveApplyForm}>
        <form onSubmit={handleSubmit(leaveApplyAction)} className="w-[320px]">
          <FormField
            control={control}
            name="leaveTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leave Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a leave type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leaveTypes?.map((leaveType) => (
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
                          "w-full justify-between text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
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
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        fixedWeeks={true}
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
                <p className="text-sm text-red-500">
                  {!!formState.errors.leaveDate ? (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      Leave start and end date is required.
                    </p>
                  ) : null}
                </p>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="reviewerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reviewer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Apply to" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leaveReviewers.map((reviewer) => (
                      <SelectItem key={reviewer.id} value={reviewer.id}>
                        <span>{reviewer.name}</span>
                        <Badge variant="outline" className="ml-3 rounded-full">
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
          <Button disabled={isPending}>Apply</Button>
        </form>
      </Form>
    </div>
  );
}
