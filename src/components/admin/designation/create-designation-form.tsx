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
import { Input } from "@ui/input";
import { Button } from "@ui/button";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateDesignationSchemaType } from "@/lib/types";
// ICONS
import { Loader2 } from "lucide-react";

export default function CreateDesignationForm() {
  const createDesignationForm = useForm<CreateDesignationSchemaType>({
    resolver: zodResolver(CreateDesignationSchema),
    defaultValues: {
      name: "",
    },
  });

  const { control, handleSubmit, formState, reset } = createDesignationForm;

  const { refetch: refetchDesignations } =
    api.designationRouter.getAll.useQuery();

  const { data: departments = [], isLoading } =
    api.departmentRouter.getAll.useQuery();

  const { mutateAsync: createDesignation } =
    api.designationRouter.createNew.useMutation();

  const createDesignationAction: SubmitHandler<
    CreateDesignationSchemaType
  > = async (formData) => {
    await createDesignation(formData);
    await refetchDesignations();
    reset({
      name: "",
      deptId: "",
    });
  };

  return (
    <Form {...createDesignationForm}>
      <form onSubmit={handleSubmit(createDesignationAction)}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Create a designation</CardTitle>
            <CardDescription>employees have a designation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
          </CardContent>
          <CardFooter>
            <Button disabled={formState.isSubmitting}>
              Create
              {formState.isSubmitting && (
                <Loader2 className="ml-3 animate-spin" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
