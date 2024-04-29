"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
// SCHEMAS
import { CreateDepartmentSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateDepartmentSchemaType } from "@/lib/types";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
// ICONS
import { Loader2 } from "lucide-react";

export default function CreateDepartmentForm() {
  const createDepartmentForm = useForm<CreateDepartmentSchemaType>({
    resolver: zodResolver(CreateDepartmentSchema),
    defaultValues: {
      name: "",
    },
  });

  const { control, handleSubmit, formState, reset } = createDepartmentForm;

  const { refetch: refetchDepartments } =
    api.departmentRouter.getAll.useQuery();

  const { mutateAsync: createDepartment } =
    api.departmentRouter.createNew.useMutation();

  const createDepartmentAction: SubmitHandler<
    CreateDepartmentSchemaType
  > = async (data) => {
    await createDepartment(data);
    await refetchDepartments();
    reset({
      name: "",
    });
  };

  return (
    <Form {...createDepartmentForm}>
      <form onSubmit={handleSubmit(createDepartmentAction)}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Create new department</CardTitle>
            <CardDescription>
              you can add employees to a department
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter>
            <Button disabled={formState.isSubmitting}>
              {formState.isSubmitting && (
                <Loader2 className="mr-3 animate-spin" />
              )}
              <span>Create Department</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
