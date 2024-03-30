"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateLeaveTypeSchema } from "@/lib/schema";
import type { CreateLeaveTypeSchemaType } from "@/lib/types";
import { api } from "@/trpc/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";

export default function CreateLeaveTypeForm() {
  const createLeaveTypeForm = useForm<CreateLeaveTypeSchemaType>({
    resolver: zodResolver(CreateLeaveTypeSchema),
    defaultValues: {
      type: "",
      daysAllowed: 5,
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
                <Input {...field} />
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
                  className="w-16 [&::-webkit-inner-spin-button]:appearance-none"
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending}>Add Leave type</Button>
      </form>
    </Form>
  );
}
