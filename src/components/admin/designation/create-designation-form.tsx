"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
// SCHEMAS
import { CreateDesignationSchema } from "@/lib/schema";
// UI
import {
  Form,
  FormLabel,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@ui//form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui//select";
import { Input } from "@ui//input";
import { Button } from "@ui//button";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateDesignationSchemaType } from "@/lib/types";
// ICONS
import { Loader2 } from "lucide-react";

export default function CreateDesignationForm() {
  const createDesignationForm = useForm<CreateDesignationSchemaType>({
    resolver: zodResolver(CreateDesignationSchema),
  });

  const { control, handleSubmit, formState } = createDesignationForm;

  const { data: departments = [], isLoading } =
    api.departmentRouter.getAll.useQuery();

  const { mutateAsync: createDesignation } =
    api.designationRouter.createNew.useMutation();

  const createDesignationAction: SubmitHandler<
    CreateDesignationSchemaType
  > = async (formData) => {
    await createDesignation(formData);
  };

  return (
    <Form {...createDesignationForm}>
      <form onSubmit={handleSubmit(createDesignationAction)}>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter designation" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="deptId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoading ? (
                    <p>Loading departments...</p>
                  ) : (
                    departments.map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
