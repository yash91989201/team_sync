"use client";
import { formatDate, parseDate } from "@/lib/date-time-utils";
import { api } from "@/trpc/react";
import {
  lastDayOfMonth,
  eachMonthOfInterval,
  format,
  startOfMonth,
  startOfToday,
  startOfYear,
  endOfYear,
} from "date-fns";
import { useState } from "react";
// UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw, TentTree } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CreateHolidayForm from "@/components/shared/holiday-calendar/create-holiday-form";

export default function HolidaySection() {
  const today = startOfToday();
  const [month, setMonth] = useState(format(today, "MMMM-yyyy"));

  const monthStart = startOfMonth(parseDate(month, "MMMM-yyyy"));
  const monthEnd = lastDayOfMonth(parseDate(month, "MMMM-yyyy"));

  const months = eachMonthOfInterval({
    start: startOfYear(today),
    end: endOfYear(today),
  }).map((month) => format(month, "MMMM-yyyy"));

  const {
    data: holidays = [],
    refetch: refetchHolidays,
    isLoading,
  } = api.holidayRouter.getByMonth.useQuery({
    start: monthStart,
    end: monthEnd,
  });

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-yellow-100">
          <TentTree className="size-8 text-yellow-500" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 self-start font-semibold">
          <p className="text-xl text-yellow-500">Holidays</p>
          <p className="text-sm text-gray-500">
            {holidays.length}
            &nbsp;holidays this month
          </p>
        </div>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CreateHolidayForm />
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          onClick={() => refetchHolidays()}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      <Separator />
      {holidays.length === 0 ? (
        <p className="flex items-center justify-center p-3 text-gray-600">
          {isLoading
            ? "Fetching this month's holidays"
            : `No holidays in ${month}`}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {holidays.map((holiday) => (
            <div
              key={holiday.id}
              className="flex w-full items-center gap-6 rounded-2xl  border bg-card p-3"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground">
                <p className="text-xl font-semibold text-primary">
                  {formatDate(holiday.date, "dd")}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-base text-gray-600">{holiday.name}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(holiday.date, "EEEE")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
