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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        <Button disabled={formState.isSubmitting}>
          Create
          {formState.isSubmitting && <Loader2 className="ml-3 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
}
