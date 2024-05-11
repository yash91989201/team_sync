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
  parse,
  startOfToday,
  startOfWeek,
  sub,
} from "date-fns";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// CUSTOM HOOKS
import useUser from "@/hooks/use-user";
// UI
import { Button } from "@/components/ui/button";
// CUSTOM COMPONENTS
import CreateHolidayForm from "@sharedComponents/holiday-calendar/create-holiday-form";
import UpdateHolidayForm from "@sharedComponents/holiday-calendar/update-holiday-form";
// ICONS
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

export default function HolidayCalendar() {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM-yyyy"));

  const user = useUser();

  const { data: holidays = [], refetch: refetchHolidays } =
    api.holidayRouter.getAll.useQuery();

  const { mutateAsync: deleteHoliday } =
    api.holidayRouter.deleteHoliday.useMutation();

  const firstDayOfCurrentMonth = parse(currentMonth, "MMMM-yyyy", new Date());

  const currentMonthHolidays = holidays
    .filter((holiday) => isSameMonth(holiday.date, firstDayOfCurrentMonth))
    .sort(
      (holiday1, holiday2) => holiday1.date.getTime() - holiday2.date.getTime(),
    );

  const getCurrentDayHoliday = (date: Date) => {
    return currentMonthHolidays.find((holiday) =>
      isSameDay(holiday.date, date),
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

  const deleteHolidayAction = async (id: string) => {
    await deleteHoliday({ id });
    await refetchHolidays();
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
            {user.isAdmin ? <CreateHolidayForm /> : null}
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
              <p>{getCurrentDayHoliday(day)?.name ?? ""}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-96 flex-col space-y-3 overflow-hidden rounded-lg bg-white">
        <time
          dateTime={format(firstDayOfCurrentMonth, "d-MMM-yyyy")}
          className="bg-primary p-3 text-white"
        >
          {format(endOfMonth(firstDayOfCurrentMonth), "MMMM yyyy")}&nbsp;
          holidays
        </time>
        <div
          className={cn(
            currentMonthHolidays.length === 0 ? "justify-center" : "",
            "flex flex-1 flex-col items-center gap-3",
          )}
        >
          {currentMonthHolidays.length === 0 ? (
            <p className="text-base text-gray-600">No holidays added</p>
          ) : (
            currentMonthHolidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex w-full items-center gap-3 rounded-xl border p-3"
              >
                <div className="flex-1">
                  <p className="text-base">{holiday.name}</p>
                  <span className="text-sm">
                    {format(holiday.date, "do MMM")}
                  </span>
                </div>
                {user?.isAdmin ? (
                  <div className="flex gap-1">
                    <UpdateHolidayForm holiday={holiday} />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl text-red-500"
                      onClick={() => deleteHolidayAction(holiday.id)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
