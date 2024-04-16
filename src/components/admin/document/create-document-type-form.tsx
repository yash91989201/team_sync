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
import { Input } from "@ui/input";
import { Button } from "@ui/button";
// ICONS

export default function CreateDocumentTypeForm() {
  const createDocumentTypeForm = useForm<CreateDocumentTypeSchemaType>({
    resolver: zodResolver(CreateDocumentTypeSchema),
    defaultValues: {
      id: generateId(15),
      type: "",
      fileType: "image/jpg",
      requiredFiles: 1,
    },
  });
  const { control, handleSubmit } = createDocumentTypeForm;

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
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="bg-white"
                  placeholder="Aadhar Card, PAN Card etc."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="fileType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-24 bg-white">
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
                  className="hide-input-spinner w-12 bg-white"
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button>Create</Button>
      </form>
    </Form>
  );
}
