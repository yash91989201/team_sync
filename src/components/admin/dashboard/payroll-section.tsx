"use client";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfDay,
  startOfYear,
} from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
// UTILS
import { api } from "@/trpc/react";
import { buttonVariants } from "@ui/button";
import { cn, formatSalary } from "@/lib/utils";
import { parseDate } from "@/lib/date-time-utils";
// TYPES
import type { EmpPayslipCardProps } from "@/lib/types";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UI
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { Separator } from "@ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
// ICONS
import { Asterisk, HandCoins, Loader2, RotateCcw } from "lucide-react";

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
    const monthDate = parseDate(month, "MMMM-yyyy");
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
            <EmpPayslipCard
              key={emp.id}
              {...emp}
              selectedMonth={currentMonth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const EmpPayslipCard = (emp: EmpPayslipCardProps) => {
  return (
    <div key={emp.id} className="flex items-center gap-3 rounded-xl border p-3">
      <Avatar className="size-12">
        <AvatarImage src={emp.imageUrl!} alt={emp.name} />
        <AvatarFallback>{emp.name}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-base">{emp.name}</p>
        <p className="text-sm font-semibold">
          Salary: {formatSalary(emp.salary, { notation: "compact" })}
        </p>
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
              Generate
            </Link>
            <TooltipProvider delayDuration={150}>
              <InstantGeneratePayslip
                empId={emp.id}
                selectedMonth={emp.selectedMonth}
              />
            </TooltipProvider>
          </div>
        ) : (
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
              Payslip Info
            </Link>
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
          </div>
        )}
      </div>
    </div>
  );
};

const InstantGeneratePayslip = ({
  empId,
  selectedMonth,
}: {
  empId: string;
  selectedMonth: string;
}) => {
  const tooltip = useToggle(false);
  const apiUtils = api.useUtils();
  const firstDayOfCurrentMonth = parseDate(selectedMonth, "MMMM-yyyy");
  const lastDayOfCurrentMonth = endOfMonth(firstDayOfCurrentMonth);

  const { data: createPayslipData, isFetching } =
    api.adminRouter.getCreatePayslipData.useQuery(
      {
        empId,
        startDate: new Date(firstDayOfCurrentMonth.setHours(15, 30, 0, 0)),
        endDate: new Date(lastDayOfCurrentMonth.setHours(15, 30, 0, 0)),
      },
      {
        enabled: tooltip.isShowing,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        staleTime: 60 * 60 * 1000,
      },
    );

  const { mutateAsync: createEmpPayslip, isPending } =
    api.adminRouter.createEmpPayslip.useMutation();

  const instantPayslipAction = async () => {
    if (createPayslipData === undefined) return;
    const actionResponse = await createEmpPayslip({
      empId,
      date: lastDayOfCurrentMonth,
      ...createPayslipData,
    });
    tooltip.hide();
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await apiUtils.statsRouter.employeesPayslip.invalidate();
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <Tooltip onOpenChange={tooltip.toggle} open={tooltip.isShowing}>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="link"
          className="h-fit w-fit px-0 text-xs text-blue-500 md:text-sm"
        >
          Instant Generate
        </Button>
      </TooltipTrigger>
      <TooltipContent className="w-[480px] p-3">
        {isFetching || createPayslipData === undefined ? (
          <PayslipTooltipSkeleton />
        ) : (
          <div className="overflow-hidden rounded-md bg-white text-gray-700">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="h-6 ">
                  <TableHead className="font-semibold ">Salary Comps</TableHead>
                  <TableHead className="text-right font-semibold">
                    Comp. Master
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Amt. Paid
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {createPayslipData.payslipComponents.map(
                  (payslipComp, index) => (
                    <TableRow key={index} className="h-6">
                      <TableCell className="font-semibold">
                        {payslipComp.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {payslipComp.amount}
                      </TableCell>
                      <TableCell className="text-right">
                        {payslipComp.amountPaid}
                      </TableCell>
                    </TableRow>
                  ),
                )}
                <TableRow className="h-6">
                  <TableCell className="font-semibold">
                    Leave Encashment
                  </TableCell>
                  <TableCell className="text-right">
                    {createPayslipData.leaveEncashment.amount}
                  </TableCell>
                  <TableCell className="text-right">
                    {createPayslipData.leaveEncashment.amountPaid}
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow className="h-6">
                  <TableCell colSpan={2} className="text-base font-semibold">
                    Total Earnings
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold">
                    {formatSalary(createPayslipData.totalSalary)}
                  </TableCell>
                </TableRow>
              </TableFooter>
              <TableCaption className="mt-0 text-gray-700">
                <div className="flex flex-col items-end gap-3 p-2">
                  <div className="flex w-full items-center justify-between gap-3">
                    <p>Days payable: {createPayslipData.daysPayable}</p>
                    <p>Paid leaves: {createPayslipData.paidLeaveDays}</p>
                    <p>Un-paid Leaves: {createPayslipData.unPaidLeaveDays}</p>
                    <p>LOP Days: {createPayslipData.lopDays}</p>
                  </div>
                  <Separator />
                  <div className="flex w-full items-center justify-between">
                    <p className="flex items-center gap-1 font-semibold">
                      <Asterisk className="size-4 text-red-500" />
                      No adjustments/arrears will be applied.
                    </p>
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-full"
                      disabled={isPending}
                      onClick={instantPayslipAction}
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      <span className="font-semibold">Generate</span>
                    </Button>
                  </div>
                </div>
              </TableCaption>
            </Table>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

const PayslipTooltipSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-lg bg-white text-xs text-gray-700">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="h-6">
            <TableHead className="font-semibold ">Salary Component</TableHead>
            <TableHead className="text-right font-semibold ">
              Component Master
            </TableHead>
            <TableHead className="text-right font-semibold ">
              Amount Paid
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4].map((item) => (
            <TableRow key={item} className="h-6">
              <TableCell colSpan={3}>
                <Skeleton className="h-5 w-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="h-6">
            <TableCell colSpan={2} className="text-base font-semibold">
              Total Earnings
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          </TableRow>
        </TableFooter>
        <TableCaption className="mt-0 text-gray-700">
          <div className="flex flex-col items-end gap-3 p-2">
            <div className="flex w-full items-center justify-between gap-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Separator />
            <div className="flex w-full items-center justify-between">
              <p className="flex items-center gap-1 font-semibold">
                <Asterisk className="size-4 text-red-500" />
                Note: No adjustments/arrears will be applied.
              </p>
              <Skeleton className="mr-2 h-8 w-16 rounded-full" />
            </div>
          </div>
        </TableCaption>
      </Table>
    </div>
  );
};

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
