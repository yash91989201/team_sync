import Link from "next/link";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
// UTILS
import { api } from "@/trpc/server";
import { buttonVariants } from "@ui/button";
import { toUTC } from "@/lib/date-time-utils";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function UpcomingHolidays() {
  const currentDate = new Date();
  const firstDayOfMonth = toUTC(startOfMonth(currentDate));
  const lastDayOfNextMonth = toUTC(endOfMonth(addMonths(currentDate, 1)));

  const holidays = await api.holidayRouter.getByMonth({
    start: firstDayOfMonth,
    end: lastDayOfNextMonth,
  });

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Upcoming holidays</CardTitle>
        <CardDescription>
          current and next month&apos;s holidays
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {holidays.length === 0 ? (
          <p className="text-sm text-gray-400">
            No holidays available until next month.
          </p>
        ) : (
          holidays.map((holiday) => (
            <p key={holiday.id} className="text-sm text-gray-700">
              <span className="font-semibold">{holiday.name} : </span>
              <span>{format(holiday.date, "MMM-yyyy")}</span>
            </p>
          ))
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Link
          href="/employee-portal/holiday-calendar"
          className={buttonVariants({
            variant: "link",
            size: "sm",
          })}
        >
          See more
        </Link>
      </CardFooter>
    </Card>
  );
}
