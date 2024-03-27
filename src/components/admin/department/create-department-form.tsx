"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// TYPES
import type { CreateDepartmentSchemaType } from "@/lib/types";
import { api } from "@/trpc/react";
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
