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
} from "@ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// ICONS
import { Loader2 } from "lucide-react";

export default function CreateLeaveTypeForm() {
  const createLeaveTypeForm = useForm<CreateLeaveTypeSchemaType>({
    resolver: zodResolver(CreateLeaveTypeSchema),
    defaultValues: {
      type: "",
      daysAllowed: 1,
      renewPeriod: "month",
      renewPeriodCount: 1,
      carryOver: false,
      paidLeave: false,
      leaveEncashment: false,
    },
  });

  const { control, handleSubmit, reset, getValues, setValue } =
    createLeaveTypeForm;

  const { refetch: refetchLeaveTypes } =
    api.leaveRouter.getLeaveTypes.useQuery();

  const { mutateAsync: createLeaveType, isPending } =
    api.leaveRouter.createLeaveType.useMutation();

  const createLeaveTypeAction: SubmitHandler<
    CreateLeaveTypeSchemaType
  > = async (formData) => {
    await createLeaveType(formData);
    await refetchLeaveTypes();
    reset();
  };

  return (
    <Form {...createLeaveTypeForm}>
      <form onSubmit={handleSubmit(createLeaveTypeAction)}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Create new leave type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex. Paid leave" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Leave type properties</FormLabel>
              <div className="space-y-2">
                <FormField
                  control={control}
                  name="paidLeave"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Is paid leave ?
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="carryOver"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            const allowsLeaveEncashment =
                              getValues("leaveEncashment");
                            if (checked && allowsLeaveEncashment) {
                              setValue("leaveEncashment", false);
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Allow carry over
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="leaveEncashment"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            const allowsCarryOver = getValues("carryOver");
                            if (checked && allowsCarryOver) {
                              setValue("carryOver", false);
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Encash unused leave
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={control}
              name="daysAllowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allowed days</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className="hide-input-spinner w-16"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end gap-1">
              <FormField
                control={control}
                name="renewPeriodCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renews every</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="hide-input-spinner w-16"
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Renew leave by this period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="month">month</SelectItem>
                        <SelectItem value="year">year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="gap-1" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              <span>Create leave type</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
