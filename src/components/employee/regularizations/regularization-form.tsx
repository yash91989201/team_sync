import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
// UTILS
import {
  convertDateFormat,
  formatDate,
  parseDate,
  parseTime,
} from "@/lib/date-time-utils";
import { cn } from "@/lib/utils";
// SCHEMAS
import { RegularizationFormSchema } from "@/lib/schema";
// TYPES
import type {
  EmployeeShiftType,
  RegularizationFormSchemaType,
} from "@/lib/types";
// UI
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";

import { Button } from "@ui/button";
// ICONS
import EmployeeShiftTimePicker from "@/components/admin/employee/employee-shift-time-picker";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { generateId } from "lucia";
import {
  CalendarClock,
  Check,
  ChevronsUpDown,
  CircleX,
  InfoIcon,
  PlusCircle,
  X,
} from "lucide-react";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import useToggle from "@/hooks/use-toggle";
import { CommandLoading } from "cmdk";
import { useDebounceValue } from "usehooks-ts";

type RegularizationFormProps = {
  attendanceInfo: {
    date: string;
    gap: boolean;
    isHoliday: boolean;
    isLeaveDay: boolean;
  }[];
  empShift: EmployeeShiftType;
};

export default function RegularizationForm({
  attendanceInfo,
  empShift,
}: RegularizationFormProps) {
  const regularizationForm = useForm<RegularizationFormSchemaType>({
    resolver: zodResolver(RegularizationFormSchema),
  });

  const reviewerSelect = useToggle(false);

  const reviewerNameInputRef = useRef<HTMLInputElement>(null);
  const [debouncedReviewerName, setDebounceEmpName] = useDebounceValue<
    string | undefined
  >(undefined, 750);

  const resetEmpNameQuery = () => {
    if (reviewerNameInputRef.current) {
      setDebounceEmpName(undefined);
      reviewerNameInputRef.current.value = "";
    }
  };

  const { data: reviewers = [], isLoading: isReviewersLoading } =
    api.attendanceRouter.getRegularizationReviewers.useQuery(
      {
        query: debouncedReviewerName ?? "",
      },
      {
        staleTime: Infinity,
      },
    );

  const { setValue, getValues } = regularizationForm;

  const reviewerId = getValues("reviewerId") ?? "";

  const appendRegularization = (date: string) => {
    const existingRegularizations = getValues("regularizations");
    const newRegularization = {
      id: generateId(15),
      punchIn: parseTime(empShift.shiftStart),
      punchOut: parseTime(empShift.shiftEnd),
      date: parseDate(date),
      reason: "",
    };

    const updatedRegularizations = [
      ...existingRegularizations,
      newRegularization,
    ];

    setValue("regularizations", updatedRegularizations);
  };

  const isRegularizationAdded = (date: string) => {
    const regularizations = getValues("regularizations");
    return !!regularizations?.find(
      ({ date: regDate }) => formatDate(regDate) === date,
    );
  };

  return (
    <div className="flex w-full gap-3">
      <Card className="h-fit w-[640px] shadow-none">
        <CardHeader>
          <CardTitle>Attendance Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0">
            {attendanceInfo.map((info, index) => (
              <div
                key={index}
                className="group relative flex aspect-square items-center justify-center border p-1"
              >
                <p
                  className={cn(
                    info.gap ? "text-red-500 group-hover:hidden" : "",
                    "text-base",
                  )}
                >
                  {convertDateFormat({
                    date: info.date,
                    from: "yyyy-MM-dd",
                    to: "dd",
                  })}
                </p>
                {info.gap ? (
                  <Button
                    variant="link"
                    size="icon"
                    className="hidden hover:no-underline group-hover:flex"
                    onClick={() => appendRegularization(info.date)}
                    disabled={isRegularizationAdded(info.date)}
                  >
                    <PlusCircle className="size-5" />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="items-center justify-between">
          <p className="flex items-center gap-1.5 text-amber-500">
            <InfoIcon className="size-4" />
            <span>
              {attendanceInfo.filter((info) => info.gap).length} days of
              attendance gap
            </span>
          </p>
          <Button variant="link" size="lg" className="w-fit p-0">
            Quick Add
          </Button>
        </CardFooter>
      </Card>
      <Form {...regularizationForm}>
        <form className="flex w-full flex-col gap-3">
          <Popover
            open={reviewerSelect.isOpen}
            onOpenChange={reviewerSelect.toggle}
          >
            <PopoverTrigger asChild>
              <div className="space-y-3">
                <p>Select Reviewer</p>
                <Button
                  role="combobox"
                  variant="outline"
                  className="w-60 justify-between"
                >
                  {reviewerId === ""
                    ? "Select Reviewer"
                    : reviewers.find(({ id }) => reviewerId === id)?.name ?? ""}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <div className="flex items-center gap-3 border-b px-3 py-1.5">
                  <MagnifyingGlassIcon className="size-4" />
                  <input
                    className="flex h-9 w-full border-none bg-transparent  py-1 text-sm outline-none  placeholder:text-muted-foreground focus-visible:outline-none"
                    placeholder="Enter name or code"
                    ref={reviewerNameInputRef}
                    onChange={(e) => setDebounceEmpName(e.target.value)}
                  />
                  <CircleX className="size-4" onClick={resetEmpNameQuery} />
                </div>
                <CommandList>
                  {isReviewersLoading ? (
                    <CommandLoading className="py-3 text-center text-sm text-muted-foreground">
                      Searching Reviewers...
                    </CommandLoading>
                  ) : (
                    <CommandEmpty>No employee found.</CommandEmpty>
                  )}
                  <CommandGroup className="p-0">
                    <ScrollArea className="h-60 px-3 py-1.5">
                      {reviewers.map((reviewer) => (
                        <CommandItem
                          className="my-1.5 flex items-center justify-start gap-3"
                          key={reviewer.id}
                          value={reviewer.id}
                          onSelect={(reviewerId) =>
                            setValue("reviewerId", reviewerId)
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              reviewerId === reviewer.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <p className="flex-1">{reviewer.name}</p>
                          <Badge className="rounded-full" variant="secondary">
                            {reviewer.role === "ADMIN" ? "ADMIN" : ""}
                          </Badge>
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Regularizations />
        </form>
      </Form>
    </div>
  );
}

const Regularizations = () => {
  const { control } = useFormContext<RegularizationFormSchemaType>();
  const { fields, remove } = useFieldArray({
    control,
    keyName: "fieldId",
    name: "regularizations",
  });

  console.debug(fields);
  return fields.length === 0 ? (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 pt-6 text-gray-400">
        <CalendarClock className="size-24" strokeWidth={1.5} />
        <p className="text-base font-semibold ">
          Select date to start regularizing
        </p>
      </CardContent>
    </Card>
  ) : (
    fields.map((field, index) => (
      <Card key={field.fieldId}>
        <CardHeader className="flex-row items-center space-y-0">
          <CardTitle className="flex-1 text-lg">
            {formatDate(field.date, "do EEEE")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => remove(index)}>
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <FormField
              control={control}
              name={`regularizations.${index}.punchIn`}
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
              name={`regularizations.${index}.punchOut`}
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
          </div>
          <FormField
            control={control}
            name={`regularizations.${index}.reason`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter reason for gap (required)"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    ))
  );
};
