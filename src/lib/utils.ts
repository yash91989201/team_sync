import dynamic from "next/dynamic";
import {
  endOfYear,
  endOfMonth,
  addMonths,
  addYears,
  isSameDay,
  startOfYear,
  addDays,
  startOfMonth,
  differenceInDays,
  isSameMonth,
  isSameYear,
  isBefore,
  format,
  parse,
  differenceInHours,
  differenceInMilliseconds,
} from "date-fns";
import { clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
// UTILS
import { parseTime, toUTC } from "./date-time-utils";
// TYPES
import type { ClassValue } from "clsx";
import type { FunctionComponent } from "react";
import type { ShiftType, } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fieldActionToast(action?: {
  status: "SUCCESS" | "FAILED";
  message: string;
}) {
  if (action !== undefined) {
    if (action.status === "SUCCESS") {
      toast.success(action.message);
    } else {
      toast.error(action.message);
    }
  }
}

export function getGreeting() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

export function getHoursDifference({ startDate, endDate }: { startDate: Date, endDate: Date }) {
  const diffInMilliseconds = differenceInMilliseconds(endDate, startDate);
  const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor(
    (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((diffInMilliseconds % (1000 * 60)) / 1000);

  return format(new Date(0, 0, 0, hours, minutes, seconds), "HH:mm:ss");
}

export function calculateShift({
  punchIn,
  punchOut,
}: {
  punchIn: string;
  punchOut: string;
}): {
  shift: ShiftType;
  hours: string;
} {

  let shift: ShiftType = "0";

  const punchInTime = parseTime(punchIn)
  const punchOutTime = parseTime(punchOut)
  const hoursDifference = differenceInHours(punchOutTime, punchInTime)

  const hours = getHoursDifference({
    startDate: punchInTime,
    endDate: punchOutTime
  })

  if (hoursDifference <= 6) shift = "0.5";
  else if (hoursDifference > 6) shift = "1";
  else shift = "0";

  return {
    shift,
    hours,
  }

}

export function getShiftTimeString(time: string) {
  const dateTime = parse(time, "HH:mm:ss", new Date())
  return format(dateTime, "hh:mm a")
}

export function getShiftTimeDate(time: string): Date {
  return parse(time, "HH:mm:ss", new Date())
}

export function getCurrentTimeDate() {
  return format(new Date(), "HH:mm a")
}

export function getRenewPeriodRange({
  renewPeriod,
  renewPeriodCount,
  referenceDate = new Date(),
}: {
  renewPeriod: "month" | "year";
  renewPeriodCount: number;
  referenceDate?: Date;
}): { startDate: Date; endDate: Date } {
  const currentDate = referenceDate;

  switch (renewPeriod) {
    case "month": {
      const startDate = toUTC(startOfMonth(currentDate));
      const endDate = endOfMonth(addMonths(startDate, renewPeriodCount - 1));
      return { startDate, endDate };
    }
    case "year": {
      const startDate = toUTC(startOfYear(currentDate));
      const endDate = endOfYear(addYears(startDate, renewPeriodCount - 1));
      return { startDate, endDate };
    }
  }
}

export function isInARenewPeriod({
  leaveDate,
  renewPeriodCount,
  renewPeriod,
}: {
  leaveDate: { from: Date; to: Date };
  renewPeriod: "month" | "year";
  renewPeriodCount: number;
}): boolean {
  const { startDate: fromStartDate, endDate: fromEndDate } =
    getRenewPeriodRange({
      renewPeriod,
      renewPeriodCount,
      referenceDate: leaveDate.from,
    });

  const { startDate: toStartDate, endDate: toEndDate } = getRenewPeriodRange({
    renewPeriod,
    renewPeriodCount,
    referenceDate: leaveDate.to,
  });
  const isSameStartDate = isSameDay(fromStartDate, toStartDate);
  const isSameEndDate = isSameDay(fromEndDate, toEndDate);
  return isSameStartDate && isSameEndDate;
}

export function getDateRangeByRenewPeriod({
  leaveDate,
  renewPeriod,
  renewPeriodCount,
}: {
  leaveDate: { from: Date; to: Date };
  renewPeriod: "month" | "year";
  renewPeriodCount: number;
}): { startDate: Date; endDate: Date; days: number }[] {
  if (
    isInARenewPeriod({
      leaveDate,
      renewPeriod,
      renewPeriodCount,
    })
  ) {
    const { startDate, endDate } = getRenewPeriodRange({
      renewPeriod,
      renewPeriodCount,
      referenceDate: leaveDate.from,
    });
    return [
      {
        startDate,
        endDate,
        days: differenceInDays(leaveDate.to, leaveDate.from) + 1,
      },
    ];
  }

  let startDate = toUTC(leaveDate.from);
  const endDate = toUTC(leaveDate.to);
  const distinctDateRange: { startDate: Date; endDate: Date; days: number }[] =
    [];

  if (renewPeriod === "month") {
    while (isBefore(startDate, endDate) || isSameMonth(startDate, endDate)) {
      // keep 1 day inclusive
      let days = 1;
      const { startDate: distinctStartDate, endDate: distinctEndDate } =
        getRenewPeriodRange({
          renewPeriod,
          renewPeriodCount,
          referenceDate: startDate,
        });

      if (isSameMonth(startDate, leaveDate.from)) {
        days += differenceInDays(distinctEndDate, startDate);
      } else if (isSameMonth(distinctStartDate, leaveDate.to)) {
        days += differenceInDays(endDate, distinctStartDate);
      } else {
        days += differenceInDays(distinctEndDate, distinctStartDate);
      }

      distinctDateRange.push({
        startDate: distinctStartDate,
        endDate: distinctEndDate,
        days,
      });
      startDate = addDays(distinctEndDate, 1);
    }
  } else {
    while (isBefore(startDate, endDate) || isSameMonth(startDate, endDate)) {
      // keep 1 day inclusive
      let days = 1;
      const { startDate: distinctStartDate, endDate: distinctEndDate } =
        getRenewPeriodRange({
          renewPeriod,
          renewPeriodCount,
          referenceDate: startDate,
        });

      if (isSameYear(startDate, leaveDate.from)) {
        days += differenceInDays(distinctEndDate, startDate);
      } else if (isSameYear(distinctStartDate, leaveDate.to)) {
        days += differenceInDays(endDate, distinctStartDate);
      } else {
        days += differenceInDays(distinctEndDate, distinctStartDate);
      }

      distinctDateRange.push({
        startDate: distinctStartDate,
        endDate: distinctEndDate,
        days,
      });
      startDate = addDays(distinctEndDate, 1);
    }
  }

  return distinctDateRange;
}

export function getBalancePeriod(props: {
  renewPeriod: "month" | "year";
  renewPeriodCount: number;
  referenceDate?: Date;
}): string {
  const { startDate, endDate } = getRenewPeriodRange(props)
  console.debug(startDate, endDate)
  if (props.renewPeriod === "month") {
    const balanceStart = format(startDate, "do")
    const balanceEnd = format(endDate, "do MMM")
    return `${balanceStart} - ${balanceEnd}`
  }
  else {
    const balanceStart = format(startDate, "MMM")
    const balanceEnd = format(endDate, "MMM yyyy")
    return `${balanceStart} - ${balanceEnd}`
  }
}

export function getLeaveDateString({ leaveDays, renewPeriod, fromDate, toDate }: {
  leaveDays: number;
  renewPeriod: "month" | "year"
  fromDate: Date;
  toDate: Date;
}): string {

  if (leaveDays === 1) {
    return format(fromDate, "do MMM")
  } else if (renewPeriod === "month") {
    return `${format(fromDate, "do MMM")} - ${format(toDate, "do MMM")}`
  } else {
    return `${format(fromDate, "d/MM/yy")} - ${format(toDate, "d/MM/yy")}`
  }
}

export function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "0 Bytes";
  }

  bytes = Number(bytes);

  if (bytes === 0) {
    return "0 Bytes";
  }
  const k = 1024;
  const dm = 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function renderOnClient<T>(Component: FunctionComponent<T>) {
  return dynamic(() => Promise.resolve(Component), { ssr: false });
}

export function formatSalary(
  salary: number | string,
  options?: {
    currency?: "USD" | "EUR" | "GBP" | "BDT" | "INR";
    notation?: Intl.NumberFormatOptions["notation"];
  },
) {
  const { currency = "INR", notation = "standard" } = options ?? {};
  const numericPrice = typeof salary === "string" ? parseFloat(salary) : salary;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}