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
} from "date-fns";
import { clsx } from "clsx";
import { toast } from "sonner";
import { generateId } from "lucia";
import { twMerge } from "tailwind-merge";
import { fromZonedTime } from "date-fns-tz";
// TYPES
import type { ClassValue } from "clsx";
import type { EmployeeAttendanceType, } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
 fixes the date being 1day back 
 when using startOfYear or startOfMonth 
 method from date-fns
*/
export function toUTC(date: Date) {
  return fromZonedTime(date, "UTC");
}

export function formatDate(date: Date): string {
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return formattedDate;
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

export function getCurrentDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export function calculateShiftHours({
  punchIn,
  punchOut,
}: {
  punchIn: string;
  punchOut: string;
}): Exclude<EmployeeAttendanceType["shiftHours"], null> {
  const [punchInHours = 0, punchInMinutes = 0, punchInSeconds = 0] = punchIn
    .split(":")
    .map(Number);
  const [punchOutHours = 0, punchOutMinutes = 0, punchOutSeconds = 0] = punchOut
    .split(":")
    .map(Number);

  const punchInInSeconds =
    punchInHours * 3600 + punchInMinutes * 60 + punchInSeconds;
  const punchOutInSeconds =
    punchOutHours * 3600 + punchOutMinutes * 60 + punchOutSeconds;

  const hoursDifference = Math.abs(punchOutInSeconds - punchInInSeconds) / 3600;

  if (hoursDifference <= 6) return "0.5";
  if (hoursDifference > 6) return "1";
  return "0";
}

export function getShiftTimeWithPeriod(time: string) {
  const [hour = 0, minute = 0] = time.split(":").map(Number);

  if (hour < 12) return `${hour}:${minute} AM`;
  if (hour === 12) return `${hour}:${minute} PM`;
  return `${hour - 12}:${minute} PM`;
}

export function getShiftTimeDate(time: string): Date {
  const [shiftHour = 0, shiftMinute = 0, shiftSecond = 0] = time
    .split(":")
    .map(Number);

  const shiftTime = new Date().setHours(shiftHour, shiftMinute, shiftSecond)
  return new Date(shiftTime)
}

export function getCurrentTimeWithPeriod() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
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

export async function uploadProfileImage(
  image: File,
): Promise<{ imageUrl: string | null }> {
  const formData = new FormData();
  formData.append("id", generateId(15));
  formData.append("image", image);
  formData.append("file_type", image.type);
  formData.append("file_size", image.size.toString());

  const res = await fetch("/api/profile-image", {
    method: "POST",
    body: formData,
  });
  const resp = (await res.json()) as UploadProfileImageStatusType;

  if (resp.status === "SUCCESS") {
    return {
      imageUrl: resp.imageUrl,
    };
  }

  return {
    imageUrl: null,
  };
}

export async function uploadEmployeeDocuments(files: File[]): Promise<UploadEmployeeDocumentStatusType> {

  const formData = new FormData()
  files.forEach((file) => formData.append("file", file))

  const res = await fetch("/api/employee-documents", {
    method: "POST",
    body: formData,
  })

  const data = (await res.json()) as UploadEmployeeDocumentStatusType

  return data;
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
