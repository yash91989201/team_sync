"use client";
import { useState } from "react";
// UTILS
import { api } from "@/trpc/react";
import { format, startOfDay } from "date-fns";
// UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Button } from "@ui/button";
import { Calendar } from "@ui/calendar";
import { Skeleton } from "@ui/skeleton";
import { DataTable } from "@sharedComponents/data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// CONSTANTS
import { EMP_SHIFT_TABLE } from "@adminComponents/tables/column-defs";
// ICONS
import {
  FilterX,
  RotateCcw,
  ChevronDown,
  CalendarIcon,
  BriefcaseBusiness,
} from "lucide-react";

type ShiftType = "0.5" | "0.75" | undefined;

export function EmpShiftSection() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const today = startOfDay(date);

  const [selectedDay, setSelectedDay] = useState(today);
  const [shift, setShift] = useState<ShiftType>(undefined);

  const isFilterUnset =
    today.getTime() === selectedDay.getTime() && shift === undefined;

  const {
    data = [],
    isFetching,
    refetch: refetchAttendanceByDate,
  } = api.statsRouter.attendanceByDate.useQuery(
    {
      date: selectedDay,
      query: {
        shift,
      },
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const resetFilters = () => {
    setShift(undefined);
    setSelectedDay(today);
  };

  if (isFetching) {
    return <EmpShiftSectionSkeleton />;
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-lime-100">
          <BriefcaseBusiness className="size-8 text-lime-500" />
        </div>
        <p className="flex-1 text-lg font-semibold text-lime-500">
          Employee Shift Info
        </p>
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
      <DataTable columns={EMP_SHIFT_TABLE} data={data} />
    </div>
  );
}

export function EmpShiftSectionSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl bg-card p-3 shadow">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-lime-100">
          <BriefcaseBusiness className="size-8 text-lime-500" />
        </div>
        <p className="flex-1 text-lg font-semibold text-lime-500">
          Employee Shift Info
        </p>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-9" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Punch in time</TableHead>
            <TableHead>Punch out time</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((item) => (
            <TableRow key={item}>
              <TableCell colSpan={6}>
                <Skeleton className="h-10" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
