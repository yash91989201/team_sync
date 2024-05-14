"use client";
import { useState } from "react";
import { format, startOfDay } from "date-fns";
// UTILS
import { api } from "@/trpc/react";
import { formatDate } from "@/lib/date-time-utils";
// UI
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { Calendar } from "@ui/calendar";
import { Separator } from "@ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// ICONS
import {
  Clock11,
  RotateCcw,
  UserRoundX,
  ChevronDown,
  MonitorCheck,
  NotebookTabs,
  CalendarIcon,
} from "lucide-react";

export function AttendanceSection() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const today = startOfDay(date);
  const [selectedDay, setSelectedDay] = useState(today);

  const {
    data: empCount = 0,
    isFetching: isEmpCountLoading,
    refetch: refetchEmpCount,
  } = api.statsRouter.empCountByJoinDate.useQuery(
    {
      date: selectedDay,
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const {
    data,
    isFetching,
    refetch: refetchAttendance,
  } = api.statsRouter.attendance.useQuery(
    {
      date: selectedDay,
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const refetchAttendanceData = async () => {
    await refetchAttendance();
    await refetchEmpCount();
  };

  if (isFetching || isEmpCountLoading) {
    return <AttendanceSectionSkeleton />;
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-amber-100">
          <NotebookTabs className="size-8 text-amber-500" />
        </div>
        <p className="flex-1 text-xl font-semibold text-amber-500">
          Employee attendance overview &minus;&nbsp;
          {formatDate(selectedDay, "do MMMM")}
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-36 items-center px-2 text-left font-normal"
            >
              <CalendarIcon className="mr-3 size-4 opacity-50" />
              <span className="flex-1"> {format(selectedDay, "do MMMM")}</span>
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
          className="w-16 gap-1"
          disabled={selectedDay.getTime() === today.getTime()}
          onClick={() => setSelectedDay(today)}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          onClick={() => refetchAttendanceData()}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      <Separator />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div className="flex items-center gap-6 rounded-2xl border p-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-green-100 md:size-10">
            <MonitorCheck className="size-5 text-green-500 md:size-6" />
          </div>
          <div className="space-y-1.5 font-semibold">
            <p className="text-base text-green-500">Employees Present</p>
            <p className="text-lg">{data?.empsPresent ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 rounded-2xl border p-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-yellow-100 md:size-10">
            <Clock11 className="size-5 text-yellow-500 md:size-6" />
          </div>
          <div className="space-y-1.5 font-semibold">
            <p className="text-base text-yellow-500">Late Employees</p>
            <p className="text-lg ">{data?.empsLateLogin ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 rounded-2xl border p-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-red-100 md:size-10">
            <UserRoundX className="size-5 text-red-500 md:size-6" />
          </div>
          <div className="space-y-1.5 font-semibold">
            <p className="text-base text-red-500">Absent Employees</p>
            <p className="text-lg">{empCount - (data?.empsPresent ?? 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// skeleton loaders
export function AttendanceSectionSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-amber-100">
          <NotebookTabs className="size-8 text-amber-500" />
        </div>
        <p className="flex-1 text-xl font-semibold text-amber-500">
          Employee attendance overview &minus;&nbsp;
          {formatDate(undefined, "do MMMM")}
        </p>
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Separator />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div className="flex h-full w-full items-center gap-6 rounded-2xl border p-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-green-100 md:size-10">
            <MonitorCheck className="size-5 text-green-500 md:size-6" />
          </div>
          <div className="space-y-1.5 font-semibold">
            <p className="text-base text-green-500">Employees Present</p>
            <Skeleton className="h-6 w-9" />
          </div>
        </div>
        <div className="flex h-full w-full items-center gap-6 rounded-2xl border p-3  ">
          <div className="flex size-8 items-center justify-center rounded-xl bg-yellow-100 md:size-10">
            <Clock11 className="size-5 text-yellow-500 md:size-6" />
          </div>
          <div className="space-y-1.5 font-semibold">
            <p className="text-base text-yellow-500">Late Employees</p>
            <Skeleton className="h-6 w-9" />
          </div>
        </div>
        <div className="flex h-full w-full items-center gap-6 rounded-2xl border p-3  ">
          <div className="flex size-8 items-center justify-center rounded-xl bg-red-100 md:size-10">
            <UserRoundX className="size-5 text-red-500 md:size-6" />
          </div>
          <div className="space-y-1.5 font-semibold">
            <p className="text-base text-red-500">Absent Employees</p>
            <Skeleton className="h-6 w-9" />
          </div>
        </div>
      </div>
    </div>
  );
}
