import { toast } from "sonner";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { EmployeeAttendanceType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  return `${hour}:${minute} PM`;
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
