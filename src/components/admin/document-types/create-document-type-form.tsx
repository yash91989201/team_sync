"use client";
import { generateId } from "lucia";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
// SCHEMAS
import { CreateDocumentTypeSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateDocumentTypeSchemaType } from "@/lib/types";
// UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
// ICONS
import { Loader2 } from "lucide-react";

export default function CreateDocumentTypeForm() {
  const createDocumentTypeForm = useForm<CreateDocumentTypeSchemaType>({
    resolver: zodResolver(CreateDocumentTypeSchema),
    defaultValues: {
      id: generateId(15),
      fileType: "image/jpg",
      requiredFiles: 1,
    },
  });
  const { control, handleSubmit, formState } = createDocumentTypeForm;

  const { mutateAsync: createDocumentType } =
    api.documentRouter.createDocumentType.useMutation();

  const createDocumentTypeAction: SubmitHandler<
    CreateDocumentTypeSchemaType
  > = async (formData) => {
    await createDocumentType(formData);
  };

  return (
    <Form {...createDocumentTypeForm}>
      <form onSubmit={handleSubmit(createDocumentTypeAction)}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Create document type</CardTitle>
            <CardDescription>
              document type will allow you to add document for employee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Aadhar Card, PAN Card etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-3">
              <FormField
                control={control}
                name="fileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Select an employee band" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-24">
                        <SelectItem value="image/jpeg">JPEG</SelectItem>
                        <SelectItem value="image/jpg">JPG</SelectItem>
                        <SelectItem value="image/png">PNG</SelectItem>
                        <SelectItem value="image/webp">WEBP</SelectItem>
                        <SelectItem value="application/pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="requiredFiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. of Files</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        className="hide-input-spinner w-12"
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={formState.isSubmitting}>
              {formState.isSubmitting && (
                <Loader2 className="mr-3 animate-spin" />
              )}
              <span>Create document type</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
