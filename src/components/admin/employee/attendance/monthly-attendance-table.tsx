"use client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import {
  format,
  startOfYear,
  startOfMonth,
  eachMonthOfInterval,
} from "date-fns";
// UTILS
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@ui/dropdown-menu";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
// CONSTANTS
import { EMP_ATTENDANCE_STAT_TABLE } from "@adminComponents/tables/column-defs";
// ICONS
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { CircleX, FilterX, RotateCcw, Search } from "lucide-react";

export default function MonthlyAttendanceTable() {
  const today = startOfMonth(new Date());

  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM"));
  const [debouncedEmpName, setDebounceEmpName] = useDebounceValue("", 750);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const empNameInputRef = useRef<HTMLInputElement>(null);

  const isFilterUnset =
    format(today, "MMMM") === currentMonth && debouncedEmpName.length === 0;

  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: today,
  }).map((month) => format(month, "MMMM"));

  const {
    data = [],
    isFetching,
    isLoading,
    refetch: refetchAttendanceByMonth,
  } = api.statsRouter.attendanceByMonth.useQuery(
    {
      name: debouncedEmpName,
      month: parseDate(currentMonth, "MMMM"),
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const table = useReactTable({
    columns: EMP_ATTENDANCE_STAT_TABLE,
    data,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  const resetTableColumns = () => {
    table.getAllColumns().forEach((column) => column.toggleVisibility(true));
  };

  const resetEmpName = () => {
    if (empNameInputRef.current) {
      setDebounceEmpName("");
      empNameInputRef.current.value = "";
    }
  };

  const resetFilters = () => {
    resetEmpName();
    setCurrentMonth(format(today, "MMMM"));
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
            onClick={() => refetchAttendanceByMonth()}
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
                  colSpan={EMP_ATTENDANCE_STAT_TABLE.length}
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

export function MonthlyAttendanceTableSkeleton() {
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
            Department
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Total Work Hours
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Working Days
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Holidays
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Approved Leaves
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Rejected Leaves
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Paid Leaves
          </TableHead>
          <TableHead className="p-2 text-base font-semibold text-gray-700 lg:p-4">
            Un-paid Leaves
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((item) => (
          <TableRow key={item}>
            <TableCell colSpan={9}>
              <Skeleton className="h-10" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
