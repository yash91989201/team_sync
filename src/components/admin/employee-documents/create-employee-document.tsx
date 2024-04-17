"use client";
import { toast } from "sonner";
import { useState } from "react";
import { generateId } from "lucia";
import { CommandLoading } from "cmdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
// UTILS
import { api } from "@/trpc/react";
import { cn, uploadEmployeeDocuments } from "@/lib/utils";
// SCHEMAS
import { CreateEmployeeDocumentFormSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateEmployeeDocumentFormSchemaType } from "@/lib/types";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// CUSTOM COMPONENTS
import { SingleFileDropzone } from "@sharedComponents/single-file-dropzone";
// ICONS
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
// CONSTANTS
import { MAX_FILE_SIZE } from "@/constants";

export default function CreateEmployeeDocumentForm() {
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  const createDocumentTypeForm = useForm<CreateEmployeeDocumentFormSchemaType>({
    resolver: zodResolver(CreateEmployeeDocumentFormSchema),
    defaultValues: {
      id: generateId(15),
      empId: "",
      uniqueDocumentId: "",
      verified: false,
      documents: [
        {
          id: generateId(15),
          file: new File([], ""),
        },
      ],
    },
  });
  const { control, handleSubmit, watch, setValue, formState } =
    createDocumentTypeForm;

  const { data: employees = [], isLoading: isEmployeesLoading } =
    api.employeeRouter.getByCodeOrName.useQuery({
      query: employeeSearchQuery,
    });

  const { data: documentTypes = [], isLoading: isDocumentTypesLoading } =
    api.documentRouter.getTypes.useQuery();

  const { mutateAsync: createEmployeeDocument } =
    api.documentRouter.createEmployeeDocument.useMutation();

  const selectedEmployeeId = watch("empId");
  const selectedEmployee = employees.find(
    (employee) => employee.id === selectedEmployeeId,
  );

  const createDocumentTypeAction: SubmitHandler<
    CreateEmployeeDocumentFormSchemaType
  > = async (formData) => {
    const { documents } = formData;
    const files = documents.map((document) => document.file);
    // first upload documents
    const fileUploadRes = await uploadEmployeeDocuments(files);

    if (fileUploadRes.status !== "SUCCESS") {
      toast.error("Document upload failed, please try again.");
      return;
    }
    const uploadedFilesData = fileUploadRes.data.filesData.map((fileData) => ({
      ...fileData,
      empDocumentId: formData.id,
    }));

    await createEmployeeDocument({
      documentFiles: uploadedFilesData,
      ...formData,
    });
  };

  return (
    <Form {...createDocumentTypeForm}>
      <form onSubmit={handleSubmit(createDocumentTypeAction)}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Create new department</CardTitle>
            <CardDescription>
              you can add employees to a department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              name="empId"
              control={control}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>Select Employee</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          role="combobox"
                          variant="outline"
                          className={cn("justify-between")}
                        >
                          {selectedEmployee === undefined
                            ? "Select Employee"
                            : selectedEmployee.name}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search by employee name or code"
                          value={employeeSearchQuery}
                          onValueChange={setEmployeeSearchQuery}
                        />
                        <CommandList>
                          {isEmployeesLoading ? (
                            <CommandLoading className="py-6 text-center text-sm text-muted-foreground">
                              Searching Employees...
                            </CommandLoading>
                          ) : (
                            <CommandEmpty>No employee found.</CommandEmpty>
                          )}
                          <CommandGroup className="max-h-64 overflow-auto">
                            {employees.map((employee) => (
                              <CommandItem
                                className="flex items-center justify-start gap-3"
                                key={employee.id}
                                value={employee.id}
                                onSelect={field.onChange}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedEmployee?.id === employee.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <p className="flex-1">{employee.name}</p>
                                <Badge
                                  className="rounded-full"
                                  variant="secondary"
                                >
                                  {employee.code}
                                </Badge>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="documentTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Document Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const selectedDocumentType = documentTypes.find(
                        (documentType) => documentType.id === value,
                      );
                      if (selectedDocumentType === undefined) return;
                      setValue("documentType", selectedDocumentType);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isDocumentTypesLoading ? (
                        <p className="px-3 py-2 text-sm text-gray-400">
                          Loading document types...
                        </p>
                      ) : documentTypes.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-400">
                          No document types available
                        </p>
                      ) : (
                        documentTypes.map(({ id, type }) => (
                          <SelectItem key={id} value={id}>
                            {type}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <DocumentsField />
          </CardContent>
          <CardFooter>
            <Button
              className="flex items-center gap-3"
              disabled={formState.isSubmitting}
            >
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

const DocumentsField = () => {
  const { control, getValues, formState } =
    useFormContext<CreateEmployeeDocumentFormSchemaType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const selectedDocumentType = getValues("documentType");
  const { requiredFiles = 1, fileType } = selectedDocumentType ?? {};
  const documentLength = getValues("documents").length;

  const addDocumentField = () => {
    append({
      id: generateId(15),
      file: new File([], ""),
    });
  };

  const deleteDocumentField = (index: number) => {
    remove(index);
  };

  if (selectedDocumentType === undefined) return null;

  return (
    <div>
      {fields.map((document, index) => (
        <div key={index}>
          <FormField
            control={control}
            name={`documents.${index}.file`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document File</FormLabel>
                <FormControl>
                  <SingleFileDropzone
                    value={field.value}
                    onChange={field.onChange}
                    width={160}
                    height={160}
                    dropzoneOptions={{
                      maxSize: MAX_FILE_SIZE.PROFILE_IMG,
                      accept: {
                        [`${fileType}`]: [],
                      },
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {index + 1 <= requiredFiles && (
            <Button type="button" onClick={() => deleteDocumentField(index)}>
              Remove
            </Button>
          )}
        </div>
      ))}
      <p className="text-[0.8rem] font-medium text-destructive">
        {formState.errors.documents?.root?.message}
      </p>
      {documentLength !== requiredFiles && (
        <Button type="button" onClick={addDocumentField}>
          Add
        </Button>
      )}
    </div>
  );
};
