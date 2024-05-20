"use client";
import {
  sub,
  add,
  parse,
  format,
  getDay,
  subDays,
  isToday,
  isAfter,
  isBefore,
  isSunday,
  isSameDay,
  endOfWeek,
  endOfMonth,
  startOfWeek,
  isSameMonth,
  startOfToday,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";
import { useState } from "react";
// UTILS
import { api } from "@/trpc/react";
import { formatDate } from "@/lib/date-time-utils";
import { cn, getShiftTimeString } from "@/lib/utils";
// TYPES
import type {
  HolidaySchemaType,
  LeaveApplicationType,
  EmployeeAttendanceType,
} from "@/lib/types";
// UI
import { Button } from "@/components/ui/button";
// ICONS
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

export default function AttendanceCalendar() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [month, setMonth] = useState(format(today, "MMMM-yyyy"));

  const firstDayOfMonth = parse(month, "MMMM-yyyy", new Date());
  const lastDayOfMonth = endOfMonth(firstDayOfMonth);

  const { data: employeeData, isFetching: isEmpDataLoading } =
    api.employeeRouter.getData.useQuery(undefined, { staleTime: Infinity });
  const joiningDate = employeeData?.joiningDate;

  const { data: attendances = [], isFetching: isAttendancesLoading } =
    api.employeeRouter.getAttendanceByMonth.useQuery(
      {
        start: firstDayOfMonth,
        end: lastDayOfMonth,
      },
      {
        staleTime: 5 * 60 * 1000,
      },
    );

  const {
    data: approvedLeaveApplications = [],
    isFetching: isLeaveApplicationsLoading,
  } = api.employeeRouter.getApprovedLeaveApplications.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { data: holidays = [] } = api.holidayRouter.getByMonth.useQuery(
    {
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    },
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  const isLoading =
    isEmpDataLoading || isAttendancesLoading || isLeaveApplicationsLoading;

  const getDayAttendance = (date: Date) => {
    return attendances.find((attendance) => isSameDay(date, attendance.date));
  };

  const getHoliday = (date: Date) => {
    return holidays.find((holiday) => isSameDay(date, holiday.date));
  };

  const getLeaveDay = (date: Date) => {
    return approvedLeaveApplications.find(
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
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(endOfMonth(firstDayOfMonth)),
  });

  const previousMonth = () => {
    const firstDayOfPreviousMonth = sub(firstDayOfMonth, { months: 1 });
    setMonth(format(firstDayOfPreviousMonth, "MMMM-yyyy"));
  };

  const nextMonth = () => {
    const firstDayOfNextMonth = add(firstDayOfMonth, { months: 1 });
    setMonth(format(firstDayOfNextMonth, "MMMM-yyyy"));
  };

  const setToday = () => {
    setSelectedDay(today);
    setMonth(format(today, "MMMM-yyyy"));
  };

  const shiftHourText = (shiftHours: "0" | "0.5" | "0.75" | "1" | null) => {
    switch (shiftHours) {
      case "0":
        return "(Absent)";
      case "0.5":
        return "(Half-day)";
      case "0.75":
        return "(Late login)";
      case "1":
        return "(Full day)";
      default:
        return "";
    }
  };

  const getSelectedDayInfo = (day: Date): string[] => {
    const text: string[] = [];
    const holiday = getHoliday(day);
    const leaveDay = getLeaveDay(day);
    const attendance = getDayAttendance(day);

    holiday !== undefined && text.push(`${holiday.name}`);
    leaveDay !== undefined && text.push(`${leaveDay.leaveType.type}`);
    attendance !== undefined &&
      text.push(
        `Shift timing: 
        ${getShiftTimeString(attendance.punchIn)} - 
        ${attendance.punchOut === null ? "TBD" : getShiftTimeString(attendance.punchOut)} 
        ${shiftHourText(attendance.shift)}`,
      );

    if (
      holiday === undefined &&
      leaveDay === undefined &&
      attendance === undefined &&
      isBefore(day, today)
    )
      text.push("Absent");

    return text;
  };

  return (
    <div className="flex gap-3">
      <div className="flex-1 rounded-lg bg-white">
        <div className="mb-3 flex items-center gap-3 bg-primary-foreground bg-white">
          <h2 className="flex-1 text-base font-semibold">{month}</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-r-none"
                onClick={previousMonth}
                disabled={formatDate(joiningDate, "MMMM-yyyy") === month}
              >
                <ChevronLeft className="size-4 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                className="rounded-none"
                onClick={setToday}
                disabled={formatDate(today, "MMMM-yyyy") === month}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-none"
                disabled={formatDate(today, "MMMM-yyyy") === month}
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
                isSameMonth(day, firstDayOfMonth)
                  ? "bg-white text-gray-700 hover:bg-primary-foreground"
                  : "bg-gray-50 text-gray-400",
                "flex aspect-video cursor-pointer flex-col justify-between gap-1.5 border p-3 text-sm",
              )}
              onClick={() => setSelectedDay(day)}
            >
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <>
                  <p
                    className={cn(
                      isSameDay(day, selectedDay)
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                        : "",
                      "font-semibold",
                    )}
                  >
                    {format(day, "d")}
                  </p>
                  <AttendanceText
                    day={day}
                    sunday={isSunday(day)}
                    holiday={getHoliday(day)}
                    leaveDay={getLeaveDay(day)}
                    attendance={getDayAttendance(day)}
                    joiningDate={employeeData?.joiningDate}
                    firstDayOfMonth={firstDayOfMonth}
                    lastDayOfMonth={lastDayOfMonth}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-96 flex-col space-y-3  rounded-lg bg-white">
        <time
          dateTime={format(selectedDay, "d-MMM-yyyy")}
          className="rounded-xl bg-primary p-3 text-white"
        >
          {format(selectedDay, "d-MMM")} Info
        </time>
        <div className="flex flex-1 flex-col gap-3 rounded-xl border">
          {getSelectedDayInfo(selectedDay).map((info) => (
            <p key={info} className="p-3">
              {info}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

const AttendanceText = ({
  attendance,
  holiday,
  leaveDay,
  sunday,
  day,
  joiningDate,
  firstDayOfMonth,
  lastDayOfMonth,
}: {
  attendance: EmployeeAttendanceType | undefined;
  holiday: HolidaySchemaType | undefined;
  leaveDay: LeaveApplicationType | undefined;
  sunday: boolean;
  day: Date;
  joiningDate?: Date;
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
}) => {
  const today = startOfToday();

  // isOutOfRange makes sure that day
  // lies between first day of month and day before today
  const isOutOfRange =
    isBefore(day, firstDayOfMonth) ||
    isAfter(day, lastDayOfMonth) ||
    isBefore(day, subDays(joiningDate!, 1)) ||
    isSameDay(day, today) ||
    isAfter(day, today);

  if (isOutOfRange) return null;

  if (isSameDay(day, joiningDate!)) {
    return <p className="flex flex-col gap-1.5 ">Joining Day</p>;
  }

  if (sunday) {
    return <p className="flex flex-col gap-1.5 ">off day</p>;
  }

  if (holiday) {
    return <p className="flex flex-col gap-1.5">{holiday.name}</p>;
  }

  if (leaveDay) {
    return <p className="flex flex-col gap-1.5">{leaveDay.leaveType.type}</p>;
  }

  if (attendance) {
    return <p className="flex flex-col gap-1.5 text-primary">P</p>;
  }

  // If none of the above conditions match, it's an absence
  return <p className="flex flex-col gap-1.5 font-semibold text-red-500">A</p>;
};
