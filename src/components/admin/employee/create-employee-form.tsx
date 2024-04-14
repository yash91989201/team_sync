"use client";
import { format } from "date-fns";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// CUSTOM COMPONENTS
import EmployeeShiftTimePicker from "@/components/admin/employee/employee-shift-time-picker";
// CONSTANTS
import { MAX_FILE_SIZE } from "@/constants";
// ICONS
import { Loader2 } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { SingleImageDropzone } from "@/components/shared/single-image-dropzone";

export default function CreateEmployeeForm() {
  const shiftStart = new Date(new Date().setHours(10, 0, 0, 0));
  const shiftEnd = new Date(new Date().setHours(8, 0, 0, 0));
  const currentYear = new Date().getFullYear();

  const createEmployeeForm = useForm<CreateEmployeeFormSchemaType>({
    defaultValues: {
      code: "",
      name: "",
      email: "",
      password: "password",
      role: "EMPLOYEE",
      isTeamLead: false,
      dept: "",
      designation: "",
      location: "",
      salary: 10000,
      empBand: "U3",
      shiftStart,
      shiftEnd,
      breakMinutes: 60,
    },
    resolver: zodResolver(CreateEmployeeFormSchema),
  });

  const { control, handleSubmit, formState, watch } = createEmployeeForm;

  const { data: departmentList = [] } = api.departmentRouter.getAll.useQuery();

  const { data: designationList = [] } =
    api.designationRouter.getAll.useQuery();

  const { mutateAsync: createEmployee } =
    api.employeeRouter.createNew.useMutation();

  const createEmployeeAction: SubmitHandler<
    CreateEmployeeFormSchemaType
  > = async (formData) => {
    const { imageUrl } = await uploadProfileImage(formData.profileImage);

    await createEmployee({
      ...formData,
      imageUrl,
    });
  };

  const selectedDept = watch("dept");
  const selectedDeptId =
    departmentList.find((department) => department.name === selectedDept)?.id ??
    "";

  const designationByDept = designationList.filter(
    (designation) => designation.deptId === selectedDeptId,
  );

  return (
    <Form {...createEmployeeForm}>
      <form
        className="flex flex-col gap-3"
        onSubmit={handleSubmit(createEmployeeAction)}
      >
        {/* Personal details */}
        <div>
          <FormField
            control={control}
            name="profileImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Image</FormLabel>
                <FormControl>
                  <SingleImageDropzone
                    value={field.value}
                    onChange={field.onChange}
                    width={160}
                    height={160}
                    dropzoneOptions={{
                      maxSize: MAX_FILE_SIZE.PROFILE_IMG,
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white"
                    placeholder="Jane Doe"
                  />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white"
                    placeholder="example@mail.com"
                  />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" readOnly={true} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>

        {/*professional details*/}
        <div>
          <FormField
            control={control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white"
                    placeholder="Enter employee code"
                  />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a department" />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue
                        className="bg-white"
                        placeholder="Select a designation"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {designationByDept.length === 0 ? (
                      <p className="p-1">
                        {selectedDeptId.length === 0
                          ? "First select a department"
                          : "Selected department has no designations"}
                      </p>
                    ) : (
                      designationByDept.map((designation) => (
                        <SelectItem
                          key={designation.id}
                          value={designation.name}
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
              <FormItem>
                <FormLabel>Employee Band</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-24 bg-white">
                      <SelectValue placeholder="Select an employee band" />
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
        {/*work details*/}
        <div>
          <FormField
            control={control}
            name="shiftStart"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
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
              <FormItem>
                <FormLabel>Break hours (in minutes.)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step={15}
                    className="hide-number-input-spinner w-12 bg-white"
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {/*additional options*/}
        <div>
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
        </div>

        <Button className="w-fit" disabled={formState.isSubmitting}>
          Create
          {formState.isSubmitting && <Loader2 className="ml-3 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
}
