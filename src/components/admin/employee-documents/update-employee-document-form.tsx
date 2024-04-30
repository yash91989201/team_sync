"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
import { updateEmployeeDocumentFile } from "@/lib/pb-utils";
// SCHEMAS
import { UpdateEmployeeDocumentSchema } from "@/lib/schema";
// TYPES
import type {
  UpdateEmployeeDocumentFormProps,
  UpdateEmployeeDocumentSchemaType,
} from "@/lib/types";
import type { SubmitHandler } from "react-hook-form";
// UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
// CUSTOM COMPONENTS
import { UpdateDocumentInput } from "./update-document-input";
// ICONS
import { Loader2 } from "lucide-react";
// CONSTANTS
import { MAX_FILE_SIZE } from "@/constants";

export default function UpdateEmployeeDocumentForm({
  documentData,
}: {
  documentData: UpdateEmployeeDocumentFormProps;
}) {
  const router = useRouter();
  const documentFiles = documentData.documentFiles;
  const documentType = documentData.documentType;
  const uniqueDocumentId = documentData.uniqueDocumentId ?? undefined;

  const { mutateAsync: updateEmployeeDocument } =
    api.documentRouter.updateEmployeeDocument.useMutation();

  const updateEmployeeDocumentForm = useForm<UpdateEmployeeDocumentSchemaType>({
    defaultValues: {
      id: documentData.id,
      uniqueDocumentId: uniqueDocumentId,
      verified: documentData.verified,
    },
    resolver: zodResolver(UpdateEmployeeDocumentSchema),
  });
  const { control, handleSubmit, formState } = updateEmployeeDocumentForm;

  const updateEmployeeDocumentAction: SubmitHandler<
    UpdateEmployeeDocumentSchemaType
  > = async (formData) => {
    const actionResponse = await updateEmployeeDocument(formData);

    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      router.refresh();
    } else {
      toast.error(actionResponse.message);
    }
  };

  // TODO: enhance ui update employee document form

  return (
    <div>
      <div>
        {documentFiles.map((documentFile, index) => (
          <UpdateDocumentInput
            key={documentFile.id}
            fileUrl={documentFile.fileUrl}
            fileType={documentType.fileType}
            fileIndex={index + 1}
            dropzoneOptions={{
              maxSize: MAX_FILE_SIZE.PROFILE_IMG,
              accept: {
                [`${documentType.fileType}`]: [],
              },
            }}
            onChange={async (file) => {
              const actionResponse = await updateEmployeeDocumentFile({
                fileId: documentFile.id,
                file,
              });

              if (actionResponse.status === "SUCCESS") {
                toast.success(actionResponse.message);
                router.refresh();
              } else {
                toast.error(actionResponse.message);
              }
            }}
          />
        ))}
        <Separator />
      </div>

      <Form {...updateEmployeeDocumentForm}>
        <form
          onSubmit={handleSubmit(updateEmployeeDocumentAction)}
          className="space-y-3"
        >
          <FormField
            control={control}
            name="uniqueDocumentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unique Document id</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="For ex. Aadhar Card no. (optional)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="verified"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Are documents verified ?
                </FormLabel>
              </FormItem>
            )}
          />

          <Button disabled={formState.isSubmitting} className="gap-1">
            {formState.isSubmitting && <Loader2 className="animate-spin" />}
            <span>Update document data</span>
          </Button>
        </form>
      </Form>
    </div>
  );
}
