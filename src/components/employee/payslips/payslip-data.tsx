"use client";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfToday,
} from "date-fns";
import { useState } from "react";
// UTILS
import { parseDate } from "@/lib/date-time-utils";
import { api } from "@/trpc/react";
// TYPES
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// CUSTOM COMPONENTS
// ICONS
import {
  NoPayslipData,
  PayslipDataTableSkeleton,
  PayslipDataTable,
} from "@sharedComponents/payslip-data-table";

export default function PayslipData({ empId }: { empId: string }) {
  const today = new Date(startOfToday().setHours(8, 30, 0, 0));

  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM-yyyy"));

  const { data: employeeProfile } = api.adminRouter.getEmployeeProfile.useQuery(
    { empId },
  );
  const joiningDate = employeeProfile?.joiningDate;

  const {
    data: currentMonthPayslip,
    isLoading,
    isFetching,
  } = api.payslipRouter.getMonthPayslip.useQuery(
    {
      empId,
      month: parseDate(currentMonth, "MMMM-yyyy"),
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const months = eachMonthOfInterval({
    start: joiningDate!,
    end: endOfMonth(today),
  }).map((month) => format(month, "MMMM-yyyy"));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-primary">View Payslip</CardTitle>
        <CardDescription>Select month to see your payslip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* month selector */}
        <div className="flex items-center justify-end">
          <Select value={currentMonth} onValueChange={setCurrentMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue
                placeholder="Select month"
                defaultValue={currentMonth}
              />
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
        {/* generate payslip form */}
        {isLoading || isFetching ? (
          <PayslipDataTableSkeleton />
        ) : currentMonthPayslip === undefined ? (
          <NoPayslipData />
        ) : currentMonthPayslip.status === "SUCCESS" ? (
          <PayslipDataTable
            payslip={currentMonthPayslip.data}
            date={parseDate(currentMonth, "MMMM-yyyy")}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
