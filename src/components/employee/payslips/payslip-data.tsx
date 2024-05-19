"use client";
import {
  format,
  endOfMonth,
  startOfToday,
  lastDayOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import { useState } from "react";
// UTILS
import { api } from "@/trpc/react";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
// CUSTOM COMPONENTS
import {
  NoPayslipData,
  PayslipDataTable,
  PayslipDataTableSkeleton,
} from "@sharedComponents/payslip-data-table";

export default function PayslipData({
  empId,
  joiningDate,
}: {
  empId: string;
  joiningDate: Date;
}) {
  const today = startOfToday();
  const [month, setMonth] = useState(format(today, "MMMM-yyyy"));
  const monthEnd = lastDayOfMonth(month);

  const {
    data: monthPayslip,
    isLoading,
    isFetching,
  } = api.payslipRouter.getMonthPayslip.useQuery(
    {
      empId,
      month: monthEnd,
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const months = eachMonthOfInterval({
    start: joiningDate,
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
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select month" defaultValue={month} />
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
        {/* payslip data table */}
        {isLoading || isFetching ? (
          <PayslipDataTableSkeleton />
        ) : monthPayslip === undefined || monthPayslip?.status === "FAILED" ? (
          <NoPayslipData />
        ) : (
          <PayslipDataTable
            empId={empId}
            date={monthEnd}
            payslipId={monthPayslip.data.id}
          />
        )}
      </CardContent>
    </Card>
  );
}
