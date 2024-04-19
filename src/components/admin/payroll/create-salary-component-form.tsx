"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
// SCHEMAS
import { CreateSalaryComponentSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateSalaryComponentSchemaType } from "@/lib/types";
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

export default function CreateSalaryComponentForm() {
  const createSalaryComponentForm = useForm<CreateSalaryComponentSchemaType>({
    resolver: zodResolver(CreateSalaryComponentSchema),
    defaultValues: {
      name: "",
    },
  });

  const { control, handleSubmit, formState, reset } = createSalaryComponentForm;

  const { refetch: refetchSalaryComponents } =
    api.salaryRouter.getComponents.useQuery();

  const { mutateAsync: createSalaryComponent } =
    api.salaryRouter.createSalaryComponent.useMutation();

  const createSalaryComponentAction: SubmitHandler<
    CreateSalaryComponentSchemaType
  > = async (data) => {
    await createSalaryComponent(data);
    await refetchSalaryComponents();
    reset();
  };

  return (
    <Form {...createSalaryComponentForm}>
      <form onSubmit={handleSubmit(createSalaryComponentAction)}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Create salary component</CardTitle>
            <CardDescription>
              salary component in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="for ex. Base Pay" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={formState.isSubmitting} className="gap-1">
              {formState.isSubmitting && <Loader2 className="animate-spin" />}
              <span>Create Salary Component</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
