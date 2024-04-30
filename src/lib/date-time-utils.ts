import { format, parse } from "date-fns"
import { fromZonedTime } from "date-fns-tz";

export function toUTC(date: Date) {
  return fromZonedTime(date, "UTC");
}

/* input: date in 'yyyy-MM-dd' format and return Date */
export function parseDate(date: string): Date {
  return parse(date, "yyyy-MM-dd", new Date())
}

/* input Date and return date in 'yyyy-MM-dd' format */
export function formatDate(date = new Date()): string {
  return format(date, "yyyy-MM-dd")
}

/* input: time in 'HH:mm:ss' format and return Date */
export function parseTime(date: string): Date {
  return parse(date, "HH:mm:ss", new Date())
}

/* input Date and return time in 'HH:mm:ss' format */
export function formatTime(date = new Date()): string {
  return format(date, "HH:mm:ss")
}