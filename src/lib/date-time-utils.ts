import { format, parse } from "date-fns"
import { fromZonedTime } from "date-fns-tz";

export function toUTC(date: Date) {
  return fromZonedTime(date, "UTC");
}

export function toIST(date: Date) {
  return fromZonedTime(date, "IST");
}

/**
 * input date as string in format 'yyyy-MM-dd'
 * get Date type
 * format date 
*/
export function parseDate(date: string, formatStr = "yyyy-MM-dd"): Date {
  return parse(date, formatStr, new Date())
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
export function parseTime(date: string, formatStr = "HH:mm:ss"): Date {
  return parse(date, formatStr, new Date())
}

/**
 * input Date and formatStr
 * get date in passed format 
 * default format is 'HH:mm:ss'
*/
export function formatTime(date = new Date(), formatStr = "HH:mm:ss"): string {
  return format(date, formatStr)
}

/**
 * input Date and formatStr
 * get date in passed format 
 * default format is 'HH:mm:ss'
*/
export function getWorkHours(hours: { hours: string | null }[]) {
  const workHours = hours.reduce((total, { hours }) => {
    if (hours === null) return total;

    const correctedHours = hours.split(".")[0]!;
    const time = parseTime(correctedHours);
    // Extract hours, minutes, and seconds from the parsed time
    const workHours = time.getHours();
    const workMinutes = time.getMinutes() / 60;
    const workSeconds = time.getSeconds() / 3600;

    return total + (workHours + workMinutes + workSeconds)
  }, 0)
  return Number(workHours.toFixed(2))
}
