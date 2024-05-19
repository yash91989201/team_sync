"use client";
import { toast } from "sonner";
import { generateId } from "lucia";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
import { uploadEmployeeDocumentFiles } from "@/lib/pb-utils";
// SCHEMAS
import { BulkUploadDocsFormSchema } from "@/lib/schema";
// TYPES
import type {
  BulkUploadFormProps,
  BulkUploadDocsFormSchemaType,
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
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
// CUSTOM COMPONENTS
import { DocumentInput } from "@adminComponents/employee-documents/document-input";
// ICONS
import { Loader2 } from "lucide-react";
// CONSTANTS
import { MAX_FILE_SIZE } from "@/constants";

export default function BulkUploadForm({
  empId,
  documentType,
}: BulkUploadFormProps) {
  const apiUtils = api.useUtils();

  const bulkUploadForm = useForm<BulkUploadDocsFormSchemaType>({
    resolver: zodResolver(BulkUploadDocsFormSchema),
    defaultValues: {
      id: generateId(15),
      empId,
      documentType,
      documentTypeId: documentType.id,
      verified: false,
    },
  });

  const { control, handleSubmit, formState } = bulkUploadForm;

  const { mutateAsync: createEmployeeDocument } =
    api.documentRouter.createEmployeeDocument.useMutation();
  console.log(formState.errors);
  const createDocumentTypeAction: SubmitHandler<
    BulkUploadDocsFormSchemaType
  > = async (formData) => {
    const { files } = formData;
    // step1: upload documents
    const fileUploadRes = await uploadEmployeeDocumentFiles(files);

    if (fileUploadRes.status !== "SUCCESS") {
      toast.error("Document upload failed, please try again.");
      return;
    }
    const uploadedFilesData = fileUploadRes.data.filesData.map((fileData) => ({
      ...fileData,
      empDocumentId: formData.id,
    }));

    // step2: create employee document
    await createEmployeeDocument({
      documentFiles: uploadedFilesData,
      ...formData,
    });

    await apiUtils.documentRouter.getEmployeeMissingDocs.invalidate({
      empId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload {documentType.type} files</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...bulkUploadForm}>
          <form
            className="space-y-3"
            onSubmit={handleSubmit(createDocumentTypeAction)}
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
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {documentType.requiredFiles}&nbsp;
                    {documentType.type} images/files
                  </FormLabel>
                  <FormControl>
                    <DocumentInput
                      value={field.value}
                      onChange={field.onChange}
                      dropzoneOptions={{
                        maxSize: MAX_FILE_SIZE.PROFILE_IMG,
                        accept: {
                          [`${documentType.fileType}`]: [],
                        },
                        maxFiles: documentType.requiredFiles,
                      }}
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
            <Button variant="secondary" className="gap-1">
              {formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              <span>Submit</span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
