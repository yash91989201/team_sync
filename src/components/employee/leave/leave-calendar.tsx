"use client";
import { useState } from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  parse,
  startOfToday,
  startOfWeek,
  sub,
} from "date-fns";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// TYPES
import type { LeaveApplicationType } from "@/lib/types";
// UI
import { Button } from "@/components/ui/button";
// ICONS
import { ChevronLeft, ChevronRight } from "lucide-react";

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

export default function LeaveCalendar() {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM-yyyy"));

  const firstDayOfCurrentMonth = parse(currentMonth, "MMMM-yyyy", new Date());

  const { data: leaveApplications = [] } =
    api.employeeRouter.getLeaveApplications.useQuery();

  const currentMonthLeaves = leaveApplications.filter((leave) =>
    isSameMonth(leave.fromDate, firstDayOfCurrentMonth),
  );

  const getCurrentDayLeave = (date: Date) => {
    return currentMonthLeaves.find(
      (leave) =>
        isWithinInterval(date, {
          start: leave.fromDate,
          end: leave.toDate,
        }) ||
        isSameDay(date, leave.fromDate) ||
        isSameDay(date, leave.toDate),
    );
  };

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayOfCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayOfCurrentMonth)),
  });

  const previousMonth = () => {
    const firstDayOfPreviousMonth = sub(firstDayOfCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayOfPreviousMonth, "MMM-yyyy"));
  };

  const nextMonth = () => {
    const firstDayOfNextMonth = add(firstDayOfCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayOfNextMonth, "MMM-yyyy"));
  };

  const setToday = () => {
    setCurrentMonth(format(today, "MMMM-yyyy"));
  };

  return (
    <div className="flex-1 rounded-lg bg-white">
      <div className="mb-3 flex items-center gap-3 bg-primary-foreground bg-white">
        <h2 className="flex-1 text-base font-semibold">{currentMonth}</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-r-none"
              onClick={previousMonth}
            >
              <ChevronLeft className="size-4 text-gray-600" />
            </Button>
            <Button variant="ghost" className="rounded-none" onClick={setToday}>
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-l-none"
              onClick={nextMonth}
            >
              <ChevronRight className="size-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 border-y text-center text-base leading-6 text-gray-500 [&>p]:border-x [&>p]:p-1.5">
        <p>Sun</p>
        <p>Mon</p>
        <p>Tue</p>
        <p>Wed</p>
        <p>Thu</p>
        <p>Fri</p>
        <p>Sat</p>
      </div>
      <div className="grid auto-rows-fr grid-cols-7">
        {days.map((day, dayIdx) => (
          <div
            key={day.toString()}
            className={cn(
              dayIdx === 0 && colStartClasses[getDay(day)],
              isToday(day) && "border-primary text-primary",
              isSameMonth(day, firstDayOfCurrentMonth)
                ? "bg-white text-gray-700 hover:bg-primary-foreground"
                : "bg-gray-50 text-gray-400",
              "flex aspect-video flex-col justify-between gap-1.5 border p-3 text-sm",
            )}
          >
            <p className="font-semibold">{format(day, "d")}</p>
            <LeaveDayText leaveData={getCurrentDayLeave(day)} />
          </div>
        ))}
      </div>
    </div>
  );
}

const LeaveDayText = ({
  leaveData,
}: {
  leaveData: LeaveApplicationType | undefined;
}) => {
  if (leaveData === undefined) return null;

  return (
    <p className="flex flex-col gap-1.5">
      <span>{leaveData.leaveType.type}</span>
      <span
        className={cn(
          leaveData.status === "pending" && "bg-amber-200/75 text-amber-600",
          leaveData.status === "approved" && "bg-green-200/75 text-green-600",
          leaveData.status === "rejected" && "bg-red-200/75 text-red-600",
          leaveData.status === "withdrawn" && "bg-gray-200/75 text-gray-600",
          "w-fit rounded-xl p-1.5 py-0.5",
        )}
      >
        {leaveData.status}
      </span>
    </p>
  );
};
