"use client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useRouter, useSearchParams } from "next/navigation";
import { eachMonthOfInterval, format, startOfDay, startOfYear } from "date-fns";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { parseDate } from "@/lib/date-time-utils";
// TYPES
import type { LeaveReqStatusType } from "@/lib/types";
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
// ICONS
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { CircleX, FilterX, RotateCcw, Search } from "lucide-react";
// CONSTANTS
import { LEAVE_STATUS } from "@/constants";
import { LEAVE_REQUESTS_TABLE } from "@adminComponents/tables/column-defs";
import { Checkbox } from "@/components/ui/checkbox";

export default function LeaveRequestsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramDate = searchParams.get("month") ?? undefined;
  const paramStatus = searchParams.get("status") ?? undefined;
  const paramEmployee = searchParams.get("employee") ?? undefined;
  const paramIsPaid = searchParams.get("paid") ?? undefined;

  const initialDate =
    paramDate !== undefined ? parseDate(paramDate) : undefined;
  const initialStatus = LEAVE_STATUS.find((status) => status === paramStatus);
  const initialEmployee = paramEmployee;
  const initialIsPaid =
    paramIsPaid === undefined ? undefined : paramIsPaid === "true";

  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const today = startOfDay(date);

  const [qDate, setQDate] = useState(initialDate ?? date);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM"));
  const [isPaid, setIsPaid] = useState<boolean | undefined>(initialIsPaid);
  const [status, setStatus] = useState<LeaveReqStatusType | undefined>(
    initialStatus !== undefined
      ? (initialStatus as LeaveReqStatusType)
      : undefined,
  );

  const empNameInputRef = useRef<HTMLInputElement>(null);
  const [debouncedEmpName, setDebounceEmpName] = useDebounceValue(
    initialEmployee,
    750,
  );

  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: today,
  }).map((month) => format(month, "MMMM"));

  const isFilterUnset =
    qDate.getTime() === today.getTime() &&
    status === undefined &&
    isPaid === undefined &&
    (debouncedEmpName === undefined || debouncedEmpName?.length === 0);

  const {
    data = [],
    isLoading,
    isFetching,
    refetch: refetchGetLeaveRequests,
  } = api.leaveRouter.getLeaveRequests.useQuery(
    {
      month: qDate,
      status,
      isPaid,
      employeeName: debouncedEmpName,
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    columns: LEAVE_REQUESTS_TABLE,
    data,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  const handleMonthChange = (month: string) => {
    const monthDate = parseDate(month, "MMMM");
    setCurrentMonth(month);
    setQDate(monthDate);
  };

  const resetEmpNameQuery = () => {
    if (empNameInputRef.current) {
      setDebounceEmpName(undefined);
      empNameInputRef.current.value = "";
    }
  };

  const resetFilters = () => {
    setQDate(today);
    setStatus(undefined);
    resetEmpNameQuery();
    setIsPaid(undefined);
    setCurrentMonth(format(today, "MMMM"));
    router.replace(`${window.location.origin}${window.location.pathname}`);
  };

  const resetTableColumns = () => {
    table.getAllColumns().forEach((column) => column.toggleVisibility(true));
  };

  return (
    <div className="space-y-3">
      {/* query header */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3">
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
              onClick={resetEmpNameQuery}
            >
              <CircleX className="size-4 text-gray-600" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Checkbox
              checked={isPaid ?? false}
              onCheckedChange={(value) => setIsPaid(value as boolean)}
            />
            <span className="text-sm">Paid leave</span>
          </div>
          <Select
            value={status}
            onValueChange={(status) => setStatus(status as LeaveReqStatusType)}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="min-w-28">
              {LEAVE_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currentMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Month" />
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
            className="gap-1.5"
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
            onClick={() => refetchGetLeaveRequests()}
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
                  colSpan={LEAVE_REQUESTS_TABLE.length}
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

export function LeaveRequestsTableSkeleton() {
  return (
    <div className="space-y-3">
      {/* query header */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-6 w-[5.25rem]" />
          <Skeleton className="h-9 w-28" />
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

const TableSkeleton = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Applied by</TableHead>
          <TableHead>Leave days</TableHead>
          <TableHead>Leave date</TableHead>
          <TableHead>Leave type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied on</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Accept / Reject</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((item) => (
          <TableRow key={item}>
            <TableCell colSpan={8}>
              <Skeleton className="h-10" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
