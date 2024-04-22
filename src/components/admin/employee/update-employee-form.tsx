"use client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// SCHEMAS
import { UpdateEmployeeSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type {
  EmployeeDataForUpdateType,
  UpdateEmployeeSchemaType,
} from "@/lib/types";
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
import SalaryComponentsField from "@/components/admin/employee/salary-components-field";
import EmployeeShiftTimePicker from "@/components/admin/employee/employee-shift-time-picker";
// ICONS
import { Asterisk, Loader2, CalendarIcon } from "lucide-react";

export default function UpdateEmployeeForm({
  employeeData,
}: {
  employeeData: EmployeeDataForUpdateType;
}) {
  const router = useRouter();

  const updateEmployeeForm = useForm<UpdateEmployeeSchemaType>({
    defaultValues: employeeData,
    resolver: zodResolver(UpdateEmployeeSchema),
  });

  const { control, handleSubmit, formState, watch, resetField } =
    updateEmployeeForm;

  const { data: departmentList = [] } = api.departmentRouter.getAll.useQuery();

  const { data: designationList = [] } =
    api.designationRouter.getAll.useQuery();

  const { mutateAsync: updateEmployee } =
    api.adminRouter.updateEmployee.useMutation();

  const selectedDeptId = watch("deptId") ?? "";
  const designationByDept = designationList.filter(
    (designation) => designation.deptId === selectedDeptId,
  );

  const clearProfessionalDetailFields = () => {
    resetField("designationId");
    resetField("deptId");
    resetField("joiningDate");
    resetField("empBand");
    resetField("code");
  };

  const clearShiftDetailFields = () => {
    resetField("shiftStart");
    resetField("shiftEnd");
    resetField("breakMinutes");
  };

  const clearSalaryDetailFields = () => {
    resetField("salaryComponents");
  };

  const clearLeaveTypesField = () => {
    resetField("leaveTypes");
  };

  const clearAdditionalDetailFields = () => {
    resetField("isTeamLead");
  };

  const updateEmployeeAction: SubmitHandler<UpdateEmployeeSchemaType> = async (
    formData,
  ) => {
    const actionResponse = await updateEmployee(formData);
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      router.refresh();
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <Form {...updateEmployeeForm}>
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(updateEmployeeAction)}
      >
        <Card aria-hidden>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Update employees data
            </CardTitle>
            <CardDescription>
              update details for {employeeData.name}
            </CardDescription>
          </CardHeader>
        </Card>

        {/*professional details*/}
        <div
          className="flex items-start gap-3"
          aria-label="2 Employee professional details section"
        >
          <Card className="hidden w-96 md:flex">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                <span>1</span>
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
                <span>1</span>
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
                Reset Section
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
                <span>2</span>
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
                <span>2</span>
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
                Reset Section
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
                <span>3</span>
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
                <span>3</span>
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
                Reset Section
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
                <span>4</span>
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
                <span>4</span>
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
                Reset Section
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
                <span>5</span>
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
                <span>5</span>
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
                Reset Section
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
                <span>Update employee</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
