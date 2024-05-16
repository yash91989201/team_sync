"use client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
// UTILS
import { api } from "@/trpc/react";
import { format, startOfDay } from "date-fns";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@ui/dropdown-menu";
import { Button } from "@ui/button";
import { Calendar } from "@ui/calendar";
import { Skeleton } from "@ui/skeleton";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// CONSTANTS
import { EMP_SHIFT_TABLE } from "@adminComponents/tables/column-defs";
// ICONS
import {
  FilterX,
  RotateCcw,
  ChevronDown,
  CalendarIcon,
  Search,
  CircleX,
} from "lucide-react";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

type ShiftType = "0.5" | "0.75" | undefined;

export default function DailyAttendanceTable() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const today = startOfDay(date);
  const [selectedDay, setSelectedDay] = useState(today);
  const [shift, setShift] = useState<ShiftType>(undefined);
  const [debouncedEmpName, setDebounceEmpName] = useDebounceValue<
    string | undefined
  >(undefined, 750);

  const empNameInputRef = useRef<HTMLInputElement>(null);

  const isFilterUnset =
    today.getTime() === selectedDay.getTime() &&
    shift === undefined &&
    (debouncedEmpName === undefined || debouncedEmpName?.length === 0);

  const {
    data = [],
    isLoading,
    isFetching,
    refetch: refetchAttendanceByDate,
  } = api.statsRouter.attendanceByDate.useQuery(
    {
      date: selectedDay,
      query: {
        shift,
        employeeName: debouncedEmpName,
      },
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    columns: EMP_SHIFT_TABLE,
    data,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  const resetEmpName = () => {
    if (empNameInputRef.current) {
      setDebounceEmpName("");
      empNameInputRef.current.value = "";
    }
  };

  const resetFilters = () => {
    resetEmpName();
    setShift(undefined);
    setSelectedDay(today);
  };

  const resetTableColumns = () => {
    table.getAllColumns().forEach((column) => column.toggleVisibility(true));
  };

  return (
    <div className="my-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
            <Input
              className="w-72 pl-8"
              placeholder="Employee name"
              ref={empNameInputRef}
              onChange={(e) => setDebounceEmpName(e.target.value)}
            />
            <Button
              size="icon"
              variant="link"
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:no-underline"
              disabled={
                debouncedEmpName === undefined || debouncedEmpName?.length === 0
              }
              onClick={resetEmpName}
            >
              <CircleX className="size-4 text-gray-600" />
            </Button>
          </div>
          <Select
            value={shift}
            onValueChange={(shift) => setShift(shift as ShiftType)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">Half day</SelectItem>
              <SelectItem value="0.75">Late login</SelectItem>
              <SelectItem value="1">Full day</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-36 items-center px-2 text-left font-normal"
              >
                <CalendarIcon className="mr-3 size-4 opacity-50" />
                <span className="flex-1"> {format(selectedDay, "do MMM")}</span>
                <ChevronDown className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" sideOffset={10}>
              <Calendar
                mode="single"
                selected={selectedDay}
                disabled={(date) => date > today}
                onSelect={(date) => {
                  if (date === undefined) return;
                  setSelectedDay(date);
                }}
              />
            </PopoverContent>
          </Popover>
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
            disabled={table
              .getAllColumns()
              .every((column) => column.getIsVisible() === true)}
            onClick={resetTableColumns}
          >
            <FilterX className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-20">
                <MixerHorizontalIcon className="mr-2 size-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isLoading ? (
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
                  colSpan={EMP_SHIFT_TABLE.length}
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
            Employee
          </TableHead>
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
            Working hours
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((item) => (
          <TableRow key={item}>
            <TableCell colSpan={5}>
              <Skeleton className="h-10" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
