"use client";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreateEmployeeSchema } from "@/lib/schema";
import type { CreateEmployeeSchemaType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

export default function CreateEmployeeForm() {
  const createEmployeeForm = useForm<CreateEmployeeSchemaType>({
    defaultValues: {
      code: "",
      name: "",
      email: "",
      password: "password",
      role: "EMPLOYEE",
      isTeamLead: false,
      joiningDate: new Date(),
      dept: "",
      designation: "",
      paidLeaves: 2,
      location: "",
      salary: 10000,
      empBand: "U3",
    },
    resolver: zodResolver(CreateEmployeeSchema),
  });

  const { control, handleSubmit, formState } = createEmployeeForm;

  const { data: departmentList = [], isLoading: departmentsLoading } =
    api.departmentRouter.getAll.useQuery();

  const { data: designationList = [], isLoading: designationsLoading } =
    api.designationRouter.getAll.useQuery();

  const { mutateAsync: createEmployee } =
    api.employeeRouter.createNew.useMutation();

  const createEmployeeAction: SubmitHandler<CreateEmployeeSchemaType> = async (
    formData,
  ) => {
    await createEmployee(formData);
  };

  return (
    <Form {...createEmployeeForm}>
      <form
        className="flex flex-col gap-3"
        onSubmit={handleSubmit(createEmployeeAction)}
      >
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter employee name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter employee email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Password</FormLabel>
              <FormControl>
                <Input {...field} readOnly={true} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="code"
          render={({ field }) => (
            <FormItem>
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
          name="dept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department for new employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departmentList.map((department) => (
                    <SelectItem key={department.id} value={department.name}>
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
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a designation for new employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {designationList.map((designation) => (
                    <SelectItem key={designation.id} value={designation.name}>
                      {designation.name}
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
          name="isTeamLead"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Make this employee team lead of department</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    if (value === "yes") field.onChange(true);
                    else field.onChange(false);
                  }}
                  defaultValue={field.value ? "yes" : "no"}
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
        <FormField
          control={control}
          name="joiningDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Joining Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
          name="paidLeaves"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Days of paid leaves</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="No. of paid leaves for employee"
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="empBand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Band</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee band" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="U1">U1</SelectItem>
                  <SelectItem value="U2">U2</SelectItem>
                  <SelectItem value="U3">U3</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-fit" disabled={formState.isSubmitting}>
          Create
          {formState.isSubmitting && <Loader2 className="ml-3 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
}
