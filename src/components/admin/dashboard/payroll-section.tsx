"use client";
import Link from "next/link";
import { useState } from "react";
import { eachMonthOfInterval, format, startOfDay, startOfYear } from "date-fns";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { buttonVariants } from "@ui/button";
import { parseDate } from "@/lib/date-time-utils";
// UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { Separator } from "@ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
// ICONS
import { HandCoins, RotateCcw } from "lucide-react";

export function PayrollSection() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const today = startOfDay(date);
  const [qDate, setQDate] = useState(date);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM-yyyy"));

  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: today,
  }).map((month) => format(month, "MMMM-yyyy"));

  const handleMonthChange = (month: string) => {
    const monthDate = parseDate(month);
    setCurrentMonth(month);
    setQDate(monthDate);
  };

  const {
    data: employeesPayslip = [],
    isFetching,
    refetch: refetchEmpPayslip,
  } = api.statsRouter.employeesPayslip.useQuery(
    {
      month: qDate,
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  if (isFetching) {
    return <PayrollSectionSkeleton />;
  }

  const empPayslipNotGeneratedCount = employeesPayslip.filter(
    (emp) => emp.payslip === null,
  ).length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-pink-100">
          <HandCoins className="size-8 text-pink-500" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 self-start font-semibold">
          <p className="text-xl text-pink-500">Employees Payroll</p>
          <p className="text-sm text-gray-500">
            {empPayslipNotGeneratedCount}
            &nbsp;employees payslip has not been generated
          </p>
        </div>
        <Select value={currentMonth} onValueChange={handleMonthChange}>
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
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          onClick={() => refetchEmpPayslip()}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      <Separator />
      {employeesPayslip.length === 0 ? (
        <p className="flex items-center justify-center p-3 text-gray-600">
          No employees to generate payslip.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {employeesPayslip.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              <Avatar className="size-12">
                <AvatarImage src={emp.imageUrl!} alt={emp.name} />
                <AvatarFallback>{emp.name}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 text-sm font-semibold text-gray-600">
                <p className="text-base">{emp.name}</p>
                {emp.payslip === null ? (
                  <div className="flex items-center gap-3">
                    <Link
                      className={cn(
                        buttonVariants({
                          variant: "link",
                        }),
                        "h-fit w-fit p-0 text-xs text-green-500 md:text-sm",
                      )}
                      href={`/admin/payroll/salary-info/${emp.id}/generate-payslip`}
                    >
                      Generate Now
                    </Link>
                    <Link
                      className={cn(
                        buttonVariants({
                          variant: "link",
                        }),
                        "h-fit w-fit p-0 text-xs text-red-500 md:text-sm",
                      )}
                      href={`/admin/payroll/salary-info/${emp.id}/generate-payslip`}
                    >
                      Instant Generate
                    </Link>
                  </div>
                ) : (
                  <Link
                    className={cn(
                      buttonVariants({
                        variant: "link",
                      }),
                      "h-fit w-fit p-0 text-xs text-blue-500 md:text-sm",
                    )}
                    target="_blank"
                    href={emp.payslip.pdfUrl}
                  >
                    View Payslip
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PayrollSectionSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-pink-100">
          <HandCoins className="size-8 text-pink-500" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 self-start font-semibold">
          <p className="text-xl text-pink-500">Employees Payroll</p>
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-9" />
      </div>
      <Separator />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col gap-2 text-sm font-semibold text-gray-600">
              <Skeleton className="h-4 w-40" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
