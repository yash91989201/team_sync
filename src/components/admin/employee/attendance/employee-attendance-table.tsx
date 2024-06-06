"use client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRef, useState } from "react";
import useToggle from "@/hooks/use-toggle";
import { useDebounceValue } from "usehooks-ts";
// UTILS
import {
  format,
  startOfYear,
  startOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { parseDate } from "@/lib/date-time-utils";
// TYPES
import type { VisibilityState } from "@tanstack/react-table";
// UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
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
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { CommandLoading } from "cmdk";
import { Skeleton } from "@ui/skeleton";
import { ScrollArea } from "@ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// CONSTANTS
import { EMP_ATTENDANCE_BY_ID_TABLE } from "@adminComponents/tables/column-defs";
// ICONS
import {
  Check,
  ChevronsUpDown,
  CircleX,
  FilterX,
  RotateCcw,
} from "lucide-react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

type ShiftType = "0.5" | "0.75" | undefined;
type EmpSelectType =
  | {
      id: string;
      code: string;
      name: string;
    }
  | undefined;

export default function EmployeeAttendanceTable() {
  const empSelect = useToggle(false);

  const today = startOfMonth(new Date());
  const [shift, setShift] = useState<ShiftType>(undefined);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM"));

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmpSelectType>(undefined);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [debouncedEmpName, setDebounceEmpName] = useDebounceValue<string>(
    "",
    750,
  );

  const empNameInputRef = useRef<HTMLInputElement>(null);

  const isFilterUnset =
    format(today, "MMMM") === currentMonth &&
    shift === undefined &&
    (debouncedEmpName === undefined || debouncedEmpName?.length === 0);

  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: today,
  }).map((month) => format(month, "MMMM"));

  const { data: employees = [], isLoading: isEmployeesLoading } =
    api.employeeRouter.getByCodeOrName.useQuery({
      query: debouncedEmpName,
    });

  const {
    data = [],
    isLoading,
    isFetching,
    refetch: refetchAttendanceByDate,
  } = api.statsRouter.empAttendanceById.useQuery(
    {
      id: selectedEmployee?.id ?? "",
      query: {
        shift,
        month: parseDate(currentMonth, "MMMM"),
      },
    },
    {
      enabled: selectedEmployee !== undefined,
      staleTime: 5 * 60 * 1000,
    },
  );

  const table = useReactTable({
    columns: EMP_ATTENDANCE_BY_ID_TABLE,
    data,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  const handleEmployeeSelect = async (empId: string) => {
    const employee = employees.find((emp) => emp.id === empId);

    if (employee === undefined) return;

    setSelectedEmployee(employee);
    empSelect.close();
  };

  const resetEmpName = () => {
    if (empNameInputRef.current) {
      setDebounceEmpName("");
      empNameInputRef.current.value = "";
    }
  };

  const resetFilters = () => {
    resetEmpName();
    setShift(undefined);
    setCurrentMonth(format(today, "MMMM"));
  };

  return (
    <div className="my-6 space-y-3">
      <div className="flex items-center gap-3">
        <Popover open={empSelect.isOpen} onOpenChange={empSelect.toggle}>
          <PopoverTrigger asChild>
            <Button
              role="combobox"
              variant="outline"
              className="w-60 justify-between"
            >
              {selectedEmployee === undefined
                ? "Select Employee"
                : selectedEmployee.name}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <div className="flex items-center gap-3 border-b px-3 py-1.5">
                <MagnifyingGlassIcon className="size-4" />
                <input
                  className="flex h-9 w-full border-none bg-transparent  py-1 text-sm outline-none  placeholder:text-muted-foreground focus-visible:outline-none"
                  placeholder="Employee name or code"
                  ref={empNameInputRef}
                  onChange={(e) => setDebounceEmpName(e.target.value)}
                />
                <CircleX className="size-4" onClick={resetEmpName} />
              </div>
              <CommandList>
                {isEmployeesLoading ? (
                  <CommandLoading className="py-3 text-center text-sm text-muted-foreground">
                    Searching Employees...
                  </CommandLoading>
                ) : (
                  <CommandEmpty>No employee found.</CommandEmpty>
                )}
                <CommandGroup className="p-0">
                  <ScrollArea className="h-60 px-3 py-1.5">
                    {employees.map((employee) => (
                      <CommandItem
                        className="my-1.5 flex items-center justify-start gap-3"
                        key={employee.id}
                        value={employee.id}
                        onSelect={handleEmployeeSelect}
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
                        <Badge className="rounded-full" variant="secondary">
                          {employee.code}
                        </Badge>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Select
          value={shift}
          onValueChange={(shift) => setShift(shift as ShiftType)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select Shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">Half day</SelectItem>
            <SelectItem value="0.75">Late login</SelectItem>
            <SelectItem value="1">Full day</SelectItem>
          </SelectContent>
        </Select>
        <Select value={currentMonth} onValueChange={setCurrentMonth}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="min-w-28">
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-1"
          disabled={isFilterUnset}
          onClick={resetFilters}
        >
          <FilterX className="size-4" />
          <span>Reset Filters</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          onClick={() => refetchAttendanceByDate()}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      {selectedEmployee === undefined ? (
        <p className="rounded-md border p-6 text-center text-gray-600">
          Select an employee to show their&apos;s attendance.
        </p>
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <Table className="border-separate border-spacing-y-3">
          <TableHeader className="overflow-hidden rounded-lg bg-primary-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none p-4">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="p-2 text-base font-semibold text-gray-700 lg:p-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(isFetching ? "animate-pulse" : "")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-2 lg:p-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={EMP_ATTENDANCE_BY_ID_TABLE.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export function DailyAttendanceTableSkeleton() {
  return (
    <div className="my-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <TableSkeleton />
    </div>
  );
}

function TableSkeleton() {
  return (
    <Table>
      <TableHeader className="overflow-hidden rounded-lg bg-primary-foreground">
        <TableRow className="border-none p-4">
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Punch-in time
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Punch-out time
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Shift
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Hours
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((item) => (
          <TableRow key={item}>
            <TableCell colSpan={4}>
              <Skeleton className="h-10" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
