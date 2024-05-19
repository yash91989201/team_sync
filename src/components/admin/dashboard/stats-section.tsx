"use client";
// UTILS
import { api } from "@/trpc/react";
import { renderOnClient } from "@/lib/utils";
import { formatDate } from "@/lib/date-time-utils";
// CUSTOM HOOKS
import useCurrentTime from "@/hooks/use-current-time";
// UI
import { Skeleton } from "@/components/ui/skeleton";
// ICONS
import {
  Building,
  CalendarDays,
  UserRoundCog,
  Users,
  Clock10,
} from "lucide-react";

export default function StatsSection() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
      <AdminCount />
      <EmpCount />
      <DepartmentCount />
      <MonthHolidays />
      <CurrentTime />
    </div>
  );
}

export function AdminCount() {
  const { data: adminCount = 0, isFetching } =
    api.statsRouter.adminCount.useQuery(undefined, {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      enabled: false,
    });

  if (isFetching) {
    return <AdminCountSkeleton />;
  }

  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <UserRoundCog className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base text-gray-600">Admins</p>
        <p className="text-lg font-semibold">{adminCount}</p>
      </div>
    </div>
  );
}

export function EmpCount() {
  const { data: empCount = 0, isFetching } = api.statsRouter.empCount.useQuery(
    undefined,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      enabled: false,
    },
  );

  if (isFetching) {
    return <EmpCountSkeleton />;
  }

  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <Users className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base text-gray-600">Employees</p>
        <p className="text-lg font-semibold">{empCount}</p>
      </div>
    </div>
  );
}

export function DepartmentCount() {
  const { data: deptCount = 0, isFetching } =
    api.statsRouter.deptCount.useQuery(undefined, {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      enabled: false,
    });

  if (isFetching) {
    return <DepartmentCountSkeleton />;
  }

  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <Building className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base text-gray-600">Departments</p>
        <p className="text-lg font-semibold">{deptCount}</p>
      </div>
    </div>
  );
}

export function MonthHolidays() {
  const { data: monthHolidays = [], isFetching } =
    api.statsRouter.monthHolidays.useQuery(undefined, {
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    });

  if (isFetching) {
    return <MonthHolidaysSkeleton />;
  }

  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <CalendarDays className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base text-gray-600">
          {formatDate(undefined, "MMMM")} month holidays
        </p>
        <p className="text-lg font-semibold">{monthHolidays.length}</p>
      </div>
    </div>
  );
}

export const CurrentTime = renderOnClient(
  () => {
    const time = useCurrentTime("HH:mm:ss a");

    return (
      <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3 shadow">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
          <Clock10 className="size-6 text-primary" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base text-gray-600">Time</p>
          <p className="text-lg font-semibold">{time}</p>
        </div>
      </div>
    );
  },
  <CurrentTimeSkeleton />,
);

// skeleton loaders
export function StatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
      <AdminCountSkeleton />
      <EmpCountSkeleton />
      <DepartmentCountSkeleton />
      <MonthHolidaysSkeleton />
      <CurrentTimeSkeleton />
    </div>
  );
}

export function AdminCountSkeleton() {
  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <UserRoundCog className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base text-gray-600">Admins</p>
        <Skeleton className="h-6 w-9" />
      </div>
    </div>
  );
}

export function EmpCountSkeleton() {
  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <Users className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base text-gray-600">Employees</p>
        <Skeleton className="h-6 w-9" />
      </div>
    </div>
  );
}

export function DepartmentCountSkeleton() {
  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <Building className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base text-gray-600">Departments</p>
        <Skeleton className="h-6 w-9" />
      </div>
    </div>
  );
}

export function MonthHolidaysSkeleton() {
  const month = formatDate(undefined, "MMMM");

  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <CalendarDays className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base text-gray-600">Holidays in {month}</p>
        <Skeleton className="h-6 w-9" />
      </div>
    </div>
  );
}

export function CurrentTimeSkeleton() {
  return (
    <div className="flex w-full items-center gap-6 rounded-2xl  bg-card p-3  shadow">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
        <Clock10 className="size-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="" />
        <p className="text-base text-gray-600">Time</p>
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}
