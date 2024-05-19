"use client";
import {
  format,
  endOfMonth,
  startOfYear,
  startOfToday,
  eachMonthOfInterval,
  startOfMonth,
} from "date-fns";
import { useState } from "react";
// UTILS
import { api } from "@/trpc/react";
import { parseDate } from "@/lib/date-time-utils";
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
import BulkGeneratePayslipForm from "@/components/admin/payroll/bulk-generate-payslip-form";
import { GeneratePayslipFormSkeleton } from "@/components/admin/payroll/generate-payslip";
import { Skeleton } from "@/components/ui/skeleton";

export default function BulkGeneratePayslip() {
  const today = startOfToday();
  const [month, setMonth] = useState(format(today, "MMMM-yyyy"));

  const months = eachMonthOfInterval({
    start: startOfYear(today),
    end: endOfMonth(today),
  }).map((month) => format(month, "MMMM-yyyy"));

  const { data: bulkPayslipEmps = [], isLoading } =
    api.payslipRouter.getBulkPayrollEmps.useQuery(
      {
        month: parseDate(month, "MMMM-yyyy"),
      },
      {
        staleTime: Infinity,
      },
    );

  if (isLoading) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Bulk generate payslip
            </CardTitle>
            <CardDescription>select payslip month</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-40" />
          </CardContent>
        </Card>
        <div className=" rounded-md bg-white p-3">
          <GeneratePayslipFormSkeleton />
        </div>
        <div className=" rounded-md bg-white p-3">
          <GeneratePayslipFormSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Bulk generate payslip
          </CardTitle>
          <CardDescription>select payslip month</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      {bulkPayslipEmps.length === 0 ? (
        <p className="rounded-md border bg-white p-6 text-gray-600">
          All employees payslips generated for this month
        </p>
      ) : (
        bulkPayslipEmps.map((payslipEmp) => (
          <BulkGeneratePayslipForm
            key={payslipEmp.empId}
            empId={payslipEmp.empId}
            employeeName={payslipEmp.name}
            payslipStartDate={startOfMonth(parseDate(month, "MMMM-yyyy"))}
          />
        ))
      )}
    </>
  );
}
