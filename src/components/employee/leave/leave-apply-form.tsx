"use client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// SCHEMAS
import { LeaveApplySchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { LeaveApplySchemaType, LeaveTypeSchemaType } from "@/lib/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Calendar } from "@ui/calendar";
import { Textarea } from "@ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// ICONS
import { CalendarIcon, Loader2 } from "lucide-react";

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
    },
  });

  const { control, handleSubmit, setValue, formState, reset } = leaveApplyForm;

  const { refetch: refetchLeaveApplications } =
    api.employeeRouter.getLeaveApplications.useQuery();

  const { data: leaveReviewers = [] } =
    api.leaveRouter.getLeaveReviewers.useQuery();

  const { mutateAsync: leaveApply } =
    api.employeeRouter.leaveApply.useMutation();

  const leaveApplyAction: SubmitHandler<LeaveApplySchemaType> = async (
    formData,
  ) => {
    const res = await leaveApply(formData);
    if (res.status === "SUCCESS") {
      reset();
      await refetchLeaveApplications();
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Form {...leaveApplyForm}>
      <form onSubmit={handleSubmit(leaveApplyAction)}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Apply for leave</CardTitle>
            <CardDescription>
              if leave balance doesnot exists for a given period it will be
              created once you apply
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormField
              control={control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((leaveType) => (
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
                          variant="outline"
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
                          <span className="inline-flex items-center text-gray-600">
                            <CalendarIcon className="mr-1.5 size-4" />
                          </span>
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
                              const diffInDays =
                                diffInMs / (24 * 60 * 60 * 1000);
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
                      <SelectTrigger>
                        <SelectValue placeholder="Apply to" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveReviewers.map((reviewer) => (
                        <SelectItem key={reviewer.id} value={reviewer.id}>
                          <span>{reviewer.name}</span>
                          <Badge
                            variant="outline"
                            className="ml-3 rounded-full"
                          >
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
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button className="gap-1" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="animate-spin" />}
              <span>Apply for leave</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
