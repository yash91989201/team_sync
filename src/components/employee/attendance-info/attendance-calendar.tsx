"use client";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isSunday,
  isToday,
  isWithinInterval,
  parse,
  startOfToday,
  startOfWeek,
  sub,
  subDays,
} from "date-fns";
import { useState } from "react";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
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
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM-yyyy"));

  const firstDayOfCurrentMonth = parse(currentMonth, "MMMM-yyyy", new Date());
  const lastDayOfCurrentMonth = endOfMonth(firstDayOfCurrentMonth);

  const { data: employeeData } = api.employeeRouter.getData.useQuery();

  const { data: attendances = [] } =
    api.employeeRouter.getAttendanceByMonth.useQuery({
      start: firstDayOfCurrentMonth,
      end: lastDayOfCurrentMonth,
    });

  const { data: approvedLeaveApplications = [] } =
    api.employeeRouter.getLeaveApplications.useQuery({
      status: "approved",
    });

  const { data: holidays = [] } = api.holidayRouter.getByMonth.useQuery({
    start: firstDayOfCurrentMonth,
    end: lastDayOfCurrentMonth,
  });

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
    setSelectedDay(today);
    setCurrentMonth(format(today, "MMMM-yyyy"));
  };

  const formatShiftTime = (time: string | null) => {
    if (time === null) return "TBD";
    return format(parse(time, "h:m:s", new Date()), "h:mm a");
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
        `Shift timing: ${formatShiftTime(attendance.punchIn)} - ${formatShiftTime(attendance.punchOut)} ${shiftHourText(attendance.shiftHours)}`,
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
              <Button
                variant="ghost"
                className="rounded-none"
                onClick={setToday}
              >
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
                "flex aspect-video cursor-pointer flex-col justify-between gap-1.5 border p-3 text-sm",
              )}
              onClick={() => setSelectedDay(day)}
            >
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
                firstDayOfCurrentMonth={firstDayOfCurrentMonth}
                lastDayOfCurrentMonth={lastDayOfCurrentMonth}
              />
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
  firstDayOfCurrentMonth,
  lastDayOfCurrentMonth,
}: {
  attendance: EmployeeAttendanceType | undefined;
  holiday: HolidaySchemaType | undefined;
  leaveDay: LeaveApplicationType | undefined;
  sunday: boolean;
  day: Date;
  joiningDate?: Date;
  firstDayOfCurrentMonth: Date;
  lastDayOfCurrentMonth: Date;
}) => {
  const today = startOfToday();
  console.debug(joiningDate);
  // isOutOfRange makes sure that day
  // lies between first day of month and day before today
  const isOutOfRange =
    isBefore(day, firstDayOfCurrentMonth) ||
    isAfter(day, lastDayOfCurrentMonth) ||
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
