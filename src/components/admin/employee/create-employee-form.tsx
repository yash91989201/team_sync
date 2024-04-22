"use client";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateId } from "lucia";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { api } from "@/trpc/react";
import { cn, uploadProfileImage } from "@/lib/utils";
// SCHEMAS
import { CreateEmployeeFormSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { CreateEmployeeFormSchemaType } from "@/lib/types";
// UI
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
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
import { Calendar } from "@ui/calendar";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
// CUSTOM COMPONENTS
import LeaveTypesField from "./leave-types-field";
import { EmployeeImageField } from "@/components/admin/employee/employee-image-field";
import EmployeeShiftTimePicker from "@/components/admin/employee/employee-shift-time-picker";
import SalaryComponentsField from "@/components/admin/employee/salary-components-field";
// CONSTANTS
import { MAX_FILE_SIZE } from "@/constants";
// ICONS
import {
  Asterisk,
  ClipboardCopy,
  Loader2,
  RotateCw,
  CalendarIcon,
} from "lucide-react";

export default function CreateEmployeeForm() {
  const currentYear = new Date().getFullYear();
  const shiftStart = new Date(new Date().setHours(10, 0, 0, 0));
  const shiftEnd = new Date(new Date().setHours(8, 0, 0, 0));

  const createEmployeeForm = useForm<CreateEmployeeFormSchemaType>({
    defaultValues: {
      name: "",
      email: "",
      password: "password",
      role: "EMPLOYEE",
      isTeamLead: false,
      location: "",
      salary: 10000,
      empBand: "U3",
      shiftStart,
      shiftEnd,
      breakMinutes: 60,
    },
    resolver: zodResolver(CreateEmployeeFormSchema),
  });

  const { control, handleSubmit, formState, watch, resetField, getValues } =
    createEmployeeForm;

  const { data: departmentList = [] } = api.departmentRouter.getAll.useQuery();

  const { data: designationList = [] } =
    api.designationRouter.getAll.useQuery();

  const { mutateAsync: createEmployee } =
    api.adminRouter.createEmployee.useMutation();

  const selectedDeptId = watch("deptId") ?? "";
  const designationByDept = designationList.filter(
    (designation) => designation.deptId === selectedDeptId,
  );

  const clearPersonalDetailFields = () => {
    resetField("name");
    resetField("email");
    resetField("dob");
    resetField("profileImage");
    resetField("password", {
      defaultValue: "password",
    });
  };

  const clearProfessionalDetailFields = () => {
    resetField("designationId", { defaultValue: "" });
    resetField("deptId", { defaultValue: "" });
    resetField("joiningDate");
    resetField("empBand");
    resetField("code", { defaultValue: "" });
  };

  const clearShiftDetailFields = () => {
    resetField("shiftStart");
    resetField("shiftEnd");
    resetField("breakMinutes");
  };

  const clearSalaryDetailFields = () => {
    resetField("salaryComponents", { defaultValue: [] });
  };

  const clearLeaveTypesField = () => {
    resetField("leaveTypes", { defaultValue: [] });
  };

  const clearAdditionalDetailFields = () => {
    resetField("isTeamLead", { defaultValue: false });
  };

  const createEmployeeAction: SubmitHandler<
    CreateEmployeeFormSchemaType
  > = async (formData) => {
    const { imageUrl } = await uploadProfileImage(formData.profileImage);
    const actionResponse = await createEmployee({
      ...formData,
      imageUrl,
    });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      clearPersonalDetailFields();
      clearProfessionalDetailFields();
      clearShiftDetailFields();
      clearSalaryDetailFields();
      clearLeaveTypesField();
      clearAdditionalDetailFields();
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <Form {...createEmployeeForm}>
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(createEmployeeAction)}
      >
        <Card aria-hidden>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Create New Employee
            </CardTitle>
            <CardDescription>
              Add details and create new employee
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Personal details */}
        <div
          className="flex items-start gap-3"
          aria-label="1 Employee personal details section"
        >
          <Card className="hidden w-96 md:flex">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>1</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Personal Details
                </CardTitle>
                <CardDescription>Employee internal details.</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader className="flex-row items-center gap-3 space-y-0 md:hidden">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>1</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Personal Details
                </CardTitle>
                <CardDescription>Employee internal details.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 md:p-6">
              <div className="flex items-center justify-center">
                <FormField
                  control={control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center justify-center">
                      <FormControl>
                        <EmployeeImageField
                          value={field.value}
                          onChange={field.onChange}
                          width={120}
                          height={120}
                          className="rounded-full"
                          dropzoneOptions={{
                            maxSize: MAX_FILE_SIZE.PROFILE_IMG,
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jane Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="example@mail.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Password</FormLabel>
                      <div className="flex items-center gap-1">
                        <FormControl>
                          <Input {...field} readOnly={true} />
                        </FormControl>
                        <Button
                          size="icon"
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const currentPassword = getValues("password");
                            await navigator.clipboard.writeText(
                              currentPassword,
                            );
                            toast.success("Password copied to clipboard");
                          }}
                          className="flex-shrink-0 rounded-xl"
                        >
                          <ClipboardCopy className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          type="button"
                          variant="outline"
                          onClick={() => {
                            resetField("password", {
                              defaultValue: generateId(15),
                            });
                          }}
                          className="flex-shrink-0 rounded-xl"
                        >
                          <RotateCw className="size-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-48 justify-start px-2 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-3 size-4 opacity-50" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>dd/mm/yyyy</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          fromYear={currentYear - 60}
                          toYear={currentYear - 18}
                          captionLayout="dropdown-buttons"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={clearPersonalDetailFields}
              >
                Clear Section
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/*professional details*/}
        <div
          className="flex items-start gap-3"
          aria-label="2 Employee professional details section"
        >
          <Card className="hidden w-96 md:flex">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>2</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Professional Details
                </CardTitle>
                <CardDescription>Employee professonal details.</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="flex-1" aria-label="Employee professional details">
            <CardHeader className="flex-row items-center gap-3 space-y-0 md:hidden">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>2</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Professional Details
                </CardTitle>
                <CardDescription>Employee professonal details.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 md:p-6">
              <FormField
                control={control}
                name="deptId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        resetField("designationId", { defaultValue: "" });
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departmentList.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="designationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a designation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {designationByDept.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            {selectedDeptId.length === 0
                              ? "Select a department to show designations"
                              : "Selected department has no designations"}
                          </p>
                        ) : (
                          designationByDept.map((designation) => (
                            <SelectItem
                              key={designation.id}
                              value={designation.id}
                            >
                              {designation.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end gap-3">
                <FormField
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Employee Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter employee code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Joining Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start px-2 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-3 size-4 opacity-50" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>dd/mm/yyyy</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="empBand"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Employee Band</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee band" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-24">
                          <SelectItem value="U1">U1</SelectItem>
                          <SelectItem value="U2">U2</SelectItem>
                          <SelectItem value="U3">U3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={clearProfessionalDetailFields}
              >
                Clear Section
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/*work details*/}
        <div
          className="flex items-start gap-3"
          aria-label="3 Employee work shift details section"
        >
          <Card className="hidden w-96 md:flex">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>3</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Work shift Details
                </CardTitle>
                <CardDescription>Employee shift details.</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 md:hidden">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>3</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Work shift Details
                </CardTitle>
                <CardDescription>Employee shift details.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-row items-center md:p-6">
              <FormField
                control={control}
                name="shiftStart"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Shift start time</FormLabel>
                    <FormControl>
                      <EmployeeShiftTimePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="shiftEnd"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Shift end time</FormLabel>
                    <FormControl>
                      <EmployeeShiftTimePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="breakMinutes"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Break hours (in minutes.)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step={15}
                        min={15}
                        className="hide-input-spinner w-14"
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={clearShiftDetailFields}
              >
                Clear Section
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/*salary component options*/}
        <div
          className="flex items-start gap-3"
          aria-label="4 Employee additional options section"
        >
          <Card className="hidden w-96 md:flex">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>4</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Salary Details
                </CardTitle>
                <CardDescription>
                  employee&apos;s salary details
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 md:hidden">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>4</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Salary Details
                </CardTitle>
                <CardDescription>
                  Add amounts for salary components
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="md:p-6">
              <SalaryComponentsField />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={clearSalaryDetailFields}
              >
                Clear Section
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/*leave details*/}
        <div
          className="flex items-start gap-3"
          aria-label="5 Employee additional options section"
        >
          <Card className="hidden w-96 md:flex">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>5</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Leave Details
                </CardTitle>
                <CardDescription>
                  Types of leaves employee can take
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 md:hidden">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>5</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Leave Details
                </CardTitle>
                <CardDescription>
                  Types of leaves employee can take
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="md:p-6">
              <LeaveTypesField />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={clearLeaveTypesField}
              >
                Clear Section
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/*additional options*/}
        <div
          className="flex items-start gap-3"
          aria-label="5 Employee additional options section"
        >
          <Card className="hidden w-96 md:flex">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>6</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Additional Options
                </CardTitle>
                <CardDescription>Employee additional options.</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 md:hidden">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>6</span>
              </div>
              <div className="mt-0">
                <CardTitle className="text-xl text-gray-700">
                  Additional Options
                </CardTitle>
                <CardDescription>Employee additional options.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="md:p-6">
              <FormField
                control={control}
                name="isTeamLead"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>
                      Make this employee team lead of department
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          if (value === "yes") field.onChange(true);
                          else field.onChange(false);
                        }}
                        value={field.value ? "yes" : "no"}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={clearAdditionalDetailFields}
              >
                Clear Section
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div
          className="flex items-start gap-3"
          aria-label="4 Click to create new employee"
        >
          <div className="hidden w-96 md:block" />
          <Card className="flex-1">
            <CardHeader>
              <CardDescription>
                <Asterisk className="inline size-4 align-super text-red-500" />
                Confirm the above details before creating a new employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="md:text-base md:font-semibold"
                size="lg"
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting && (
                  <Loader2 className="mr-3 animate-spin" />
                )}
                <span>Create new employee</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
