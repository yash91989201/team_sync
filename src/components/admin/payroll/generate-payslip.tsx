"use client";
import { useState } from "react";
import {
  parse,
  format,
  endOfMonth,
  startOfToday,
  eachMonthOfInterval,
} from "date-fns";
// UTILS
import { api } from "@/trpc/react";
// UI
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
// CUSTOM COMPONENTS
import GeneratePayslipForm from "./generate-payslip-form";
import { PayslipDaysInfoSkeleton } from "@/components/shared/payslip-days-info";
import { PayslipTable } from "@/components/employee/payslips/payslip-data";

export default function GeneratePayslip({ empId }: { empId: string }) {
  const today = new Date(startOfToday().setHours(8, 30, 0, 0));

  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM-yyyy"));
  const firstDayOfCurrentMonth = parse(currentMonth, "MMMM-yyyy", new Date());
  const lastDayOfCurrentMonth = endOfMonth(firstDayOfCurrentMonth);

  const { data: employeeProfile } = api.adminRouter.getEmployeeProfile.useQuery(
    { empId },
  );
  const joiningDate = employeeProfile?.joiningDate;

  const {
    data: payslipData,
    isLoading: isMonthPayslipLoading,
    isFetching: isMonthPayslipFetching,
  } = api.payslipRouter.getMonthPayslip.useQuery(
    {
      empId,
      month: firstDayOfCurrentMonth,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: createPayslipData,
    isLoading,
    isFetching,
  } = api.adminRouter.getCreatePayslipData.useQuery(
    {
      empId,
      startDate: new Date(firstDayOfCurrentMonth.setHours(15, 30, 0, 0)),
      endDate: new Date(lastDayOfCurrentMonth.setHours(15, 30, 0, 0)),
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const showSkeleton =
    isMonthPayslipLoading || isMonthPayslipFetching || isLoading || isFetching;

  const months = eachMonthOfInterval({
    start: joiningDate!,
    end: endOfMonth(today),
  }).map((month) => format(month, "MMMM-yyyy"));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-primary">
          Generate Payslip
        </CardTitle>
        <CardDescription>Select a month and generate payslip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* month selector */}
        <div className="flex items-center justify-end">
          <Select value={currentMonth} onValueChange={setCurrentMonth}>
            <SelectTrigger className="w-[160px]">
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
        {/* generate payslip form */}
        {showSkeleton ? (
          <GeneratePayslipFormSkeleton />
        ) : payslipData !== undefined ? (
          <PayslipTable payslip={payslipData} />
        ) : (
          <GeneratePayslipForm
            empId={empId}
            date={lastDayOfCurrentMonth}
            payslipData={createPayslipData!}
          />
        )}
      </CardContent>
    </Card>
  );
}

const GeneratePayslipFormSkeleton = () => {
  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Salary Component</TableHead>
            <TableHead>Comp Master</TableHead>
            <TableHead className="w-40">Adjustment</TableHead>
            <TableHead className="w-40">Arrears</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((item) => (
            <TableRow key={item}>
              <TableCell colSpan={6}>
                <Skeleton className="h-10" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell colSpan={2} className="text-right">
              <Skeleton className="h-6 w-32" />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex items-center justify-end">
        <Skeleton className="h-11 w-44" />
      </div>
      <PayslipDaysInfoSkeleton />
    </div>
  );
};
