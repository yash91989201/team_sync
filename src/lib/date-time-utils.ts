import { format, parse } from "date-fns"
import { fromZonedTime } from "date-fns-tz";

export function toUTC(date: Date) {
  return fromZonedTime(date, "UTC");
}

export function parseDate(date: string): Date {
  return parse(date, "yyyy-MM-dd", new Date())
}

export function formatDate(date = new Date()): string {
  return format(date, "yyyy-MM-dd")
}

export function parseTime(date: string): Date {
  return parse(date, "HH:mm:ss", new Date())
}

export function formatTime(date = new Date()): string {
  return format(date, "HH:mm:ss")
}