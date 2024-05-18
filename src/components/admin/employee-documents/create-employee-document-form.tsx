"use client";
import { useRef } from "react";
import { toast } from "sonner";
import { generateId } from "lucia";
import { CommandLoading } from "cmdk";
import { useForm } from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { uploadEmployeeDocumentFiles } from "@/lib/pb-utils";
// SCHEMAS
import { CreateEmployeeDocumentFormSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateEmployeeDocumentFormSchemaType } from "@/lib/types";
// UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@ui/command";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// CUSTOM COMPONENTS
import { DocumentInput } from "@adminComponents/employee-documents/document-input";
// ICONS
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Check, ChevronsUpDown, CircleX, Loader2 } from "lucide-react";
// CONSTANTS
import { MAX_FILE_SIZE } from "@/constants";

export default function CreateEmployeeDocumentForm() {
  const empNameInputRef = useRef<HTMLInputElement>(null);
  const [debouncedEmpName, setDebounceEmpName] = useDebounceValue<
    string | undefined
  >(undefined, 750);

  const resetEmpNameQuery = () => {
    if (empNameInputRef.current) {
      setDebounceEmpName(undefined);
      empNameInputRef.current.value = "";
    }
  };

  const createDocumentTypeForm = useForm<CreateEmployeeDocumentFormSchemaType>({
    resolver: zodResolver(CreateEmployeeDocumentFormSchema),
    defaultValues: {
      id: generateId(15),
      uniqueDocumentId: "",
      verified: false,
    },
  });
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState,
    getValues,
    reset,
  } = createDocumentTypeForm;

  const selectedDocumentType = getValues("documentType");

  const { refetch: refetchEmployeesDocuments } =
    api.documentRouter.getEmployeesDocuments.useQuery();

  const { data: employees = [], isLoading: isEmployeesLoading } =
    api.employeeRouter.getByCodeOrName.useQuery(
      {
        query: debouncedEmpName ?? "",
      },
      {
        staleTime: Infinity,
      },
    );

  const { data: documentTypes = [], isLoading: isDocumentTypesLoading } =
    api.documentRouter.getTypes.useQuery(undefined, {
      staleTime: Infinity,
    });

  const { mutateAsync: createEmployeeDocument } =
    api.documentRouter.createEmployeeDocument.useMutation();

  const selectedEmployeeId = watch("empId");
  const selectedEmployee = employees.find(
    (employee) => employee.id === selectedEmployeeId,
  );

  const createDocumentTypeAction: SubmitHandler<
    CreateEmployeeDocumentFormSchemaType
  > = async (formData) => {
    const { files } = formData;
    // first upload documents
    const fileUploadRes = await uploadEmployeeDocumentFiles(files);

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
    await refetchEmployeesDocuments();
    reset();
  };

  return (
    <Form {...createDocumentTypeForm}>
      <form onSubmit={handleSubmit(createDocumentTypeAction)}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Add employee documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                          className="justify-between"
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
                        <div className="flex items-center border-b px-3">
                          <MagnifyingGlassIcon className="mr-2 size-4 shrink-0 opacity-50" />
                          <input
                            className="flex h-9 w-full border-none bg-transparent px-3 py-1 text-sm outline-none  placeholder:text-muted-foreground focus-visible:outline-none"
                            placeholder="Employee name or code"
                            ref={empNameInputRef}
                            onChange={(e) => setDebounceEmpName(e.target.value)}
                          />
                          <CircleX
                            className="ml-2 size-4 text-gray-600 opacity-50"
                            onClick={resetEmpNameQuery}
                          />
                        </div>
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
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isDocumentTypesLoading ? (
                        <p className="px-3 py-2 text-sm text-gray-600">
                          Loading document types...
                        </p>
                      ) : documentTypes.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-600">
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

            {selectedDocumentType === undefined ? null : (
              <>
                <FormField
                  control={control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedDocumentType.requiredFiles}&nbsp;
                        {selectedDocumentType.type} images/files
                      </FormLabel>
                      <FormControl>
                        <DocumentInput
                          value={field.value}
                          onChange={field.onChange}
                          dropzoneOptions={{
                            maxSize: MAX_FILE_SIZE.PROFILE_IMG,
                            accept: {
                              [`${selectedDocumentType.fileType}`]: [],
                            },
                            maxFiles: selectedDocumentType.requiredFiles,
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
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="flex items-center gap-1"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting && <Loader2 className="animate-spin" />}
              <span>Create Department</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
