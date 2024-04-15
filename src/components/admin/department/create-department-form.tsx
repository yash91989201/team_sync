"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
// SCHEMAS
import { CreateDepartmentSchema } from "@/lib/schema";
// UI
import {
  Form,
  FormLabel,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@ui//form";
import { Input } from "@ui//input";
import { Button } from "@ui//button";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateDepartmentSchemaType } from "@/lib/types";
// ICONS
import { Loader2 } from "lucide-react";

export default function CreateDepartmentForm() {
  const createDepartmentForm = useForm<CreateDepartmentSchemaType>({
    resolver: zodResolver(CreateDepartmentSchema),
  });

  const { control, handleSubmit, formState } = createDepartmentForm;

  const { mutateAsync: createDepartment } =
    api.departmentRouter.createNew.useMutation();

  const createDepartmentAction: SubmitHandler<
    CreateDepartmentSchemaType
  > = async (data) => {
    await createDepartment(data);
  };

  return (
    <Form {...createDepartmentForm}>
      <form onSubmit={handleSubmit(createDepartmentAction)}>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter department name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={formState.isSubmitting}>
          Create
          {formState.isSubmitting && <Loader2 className="ml-3 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
}
