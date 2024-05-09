import { format, parse } from "date-fns"
import { fromZonedTime } from "date-fns-tz";

export function toUTC(date: Date) {
  return fromZonedTime(date, "UTC");
}

/**
 * input date as string
 * get Date type
 * format date 
*/
export function parseDate(date: string): Date {
  return parse(date, "yyyy-MM-dd", new Date())
}

/**
 * input Date and formatStr
 * get date in passed format 
 * default format is 'yyyy-MM-dd' 
*/
export function formatDate(date = new Date(), formatStr = "yyyy-MM-dd"): string {
  return format(date, formatStr)
}

/**
 * input date as string
 * get Date type 
 * format time
*/
export function parseTime(date: string): Date {
  return parse(date, "HH:mm:ss", new Date())
}

/**
 * input Date and formatStr
 * get date in passed format 
 * default format is 'HH:mm:ss'
*/
export function formatTime(date = new Date(), formatStr = "HH:mm:ss"): string {
  return format(date, formatStr)
}