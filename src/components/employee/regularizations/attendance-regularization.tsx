"use client";
import {
  isSameYear,
  endOfMonth,
  isSameMonth,
  startOfToday,
  startOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import { useState } from "react";
// UTILS
import { api } from "@/trpc/react";
import { formatDate, parseDate } from "@/lib/date-time-utils";
// UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import RegularizationForm from "@/components/employee/regularizations/regularization-form";

export default function AttendanceRegularizations() {
  const today = startOfToday();
  const [month, setMonth] = useState(formatDate(today, "MMMM-yyyy"));
  const monthStart = startOfMonth(parseDate(month, "MMMM-yyyy"));
  const monthEnd = endOfMonth(parseDate(month, "MMMM-yyyy"));

  const { data: empData } = api.employeeRouter.getData.useQuery();
  const { data: empShift } = api.employeeRouter.getShift.useQuery();
  const joiningDate = empData?.joiningDate ?? new Date();

  const gapStartDate =
    isSameMonth(joiningDate, monthStart) && isSameYear(joiningDate, monthStart)
      ? joiningDate
      : monthStart;

  const gapEndDate =
    isSameMonth(today, monthEnd) && isSameYear(today, monthEnd)
      ? today
      : monthEnd;

  const { data: attendanceGaps } =
    api.attendanceRouter.getAttendanceGaps.useQuery({
      start: gapStartDate,
      end: gapEndDate,
    });

  const months = eachMonthOfInterval({
    start: joiningDate,
    end: today,
  }).map((month) => formatDate(month, "MMMM-yyyy"));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
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
      </div>
      {attendanceGaps !== undefined && empShift !== undefined ? (
        <RegularizationForm
          attendanceInfo={attendanceGaps}
          empShift={empShift}
        />
      ) : (
        <p>No regularization data available. Try later.</p>
      )}
    </div>
  );
}
