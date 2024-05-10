// UI
import { Skeleton } from "@ui/skeleton";
// ICONS
import {
  BookX,
  Calendar,
  CalendarCheck2,
  CalendarDays,
  CalendarMinus,
  CalendarOff,
  HandCoins,
} from "lucide-react";

type PayslipDaysInfoProps = {
  calendarDays: number;
  daysPayable: number;
  lopDays: number;
  presentDays: number;
  paidLeaveDays: number;
  holidays: number;
  unPaidLeaveDays: number;
  leaveEncashmentDays: number;
};

export function PayslipDaysInfo(payslip: PayslipDaysInfoProps) {
  return (
    <div className="space-y-1.5 text-gray-600">
      <p className="text-base font-medium text-gray-600">Additional Info</p>
      <div className="grid grid-cols-4 gap-3 text-base ">
        <p className="flex items-center justify-between gap-3 rounded-lg bg-blue-100 p-3 text-blue-600">
          <Calendar className="size-4" />
          <span className="flex-1">Calendar Days</span>
          <span className="font-semibold">{payslip.calendarDays}</span>
        </p>
        <p className="flex items-center justify-between gap-3 rounded-lg bg-green-100 p-3 text-green-600">
          <HandCoins className="size-4" />
          <span className="flex-1">Days Payable</span>
          <span className="font-semibold">{payslip.daysPayable}</span>
        </p>
        <p className="flex items-center justify-between gap-3 rounded-lg bg-orange-100 p-3 text-orange-600">
          <CalendarMinus className="size-4" />
          <span className="flex-1">LOP Days</span>
          <span className="font-semibold">{payslip.lopDays}</span>
        </p>
        <p className="flex items-center justify-between gap-3 rounded-lg bg-pink-100 p-3 text-pink-600">
          <CalendarCheck2 className="size-4" />
          <span className="flex-1">Present Days</span>
          <span className="font-semibold">{payslip.presentDays}</span>
        </p>
        <p className="flex items-center justify-between gap-3 rounded-lg bg-fuchsia-100 p-3 text-fuchsia-600">
          <CalendarDays className="size-4" />
          <span className="flex-1">Paid Leaves</span>
          <span className="font-semibold">{payslip.paidLeaveDays}</span>
        </p>
        <p className="rounded-mg flex items-center justify-between gap-3 rounded-lg bg-violet-100 p-3 text-violet-600">
          <CalendarOff className="size-4" />
          <span className="flex-1">Holidays</span>
          <span className="font-semibold">{payslip.holidays}</span>
        </p>
        <p className="rounded-mg flex items-center justify-between gap-3 rounded-lg bg-lime-100 p-3 text-lime-600">
          <BookX className="size-4" />
          <span className="flex-1">Un-Paid Leaves</span>
          <span className="font-semibold">{payslip.unPaidLeaveDays}</span>
        </p>
        <p className="rounded-mg flex items-center justify-between gap-3 rounded-lg bg-indigo-100 p-3 text-indigo-600">
          <BookX className="size-4" />
          <span className="flex-1">Leave Encashment Days</span>
          <span className="font-semibold">{payslip.leaveEncashmentDays}</span>
        </p>
      </div>
    </div>
  );
}

export function NoPayslipDaysInfo() {
  return (
    <div className="space-y-1.5 text-gray-600">
      <p className="text-base font-medium text-gray-600">Additional Info</p>
      <div className="grid grid-cols-4 gap-3 text-base">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-100 p-3 text-blue-600">
          <Calendar className="size-4" />
          <span className="flex-1">Calendar Days</span>
          <span>N/A</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-green-100 p-3 text-green-600">
          <HandCoins className="size-4" />
          <span className="flex-1">Days Payable</span>
          <span>N/A</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-orange-100 p-3 text-orange-600">
          <CalendarMinus className="size-4" />
          <span className="flex-1">LOP Days</span>
          <span>N/A</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-pink-100 p-3 text-pink-600">
          <CalendarCheck2 className="size-4" />
          <span className="flex-1">Present Days</span>
          <span>N/A</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-fuchsia-100 p-3 text-fuchsia-600">
          <CalendarDays className="size-4" />
          <span className="flex-1">Paid Leave Days</span>
          <span>N/A</span>
        </div>
        <div className="rounded-mg flex items-center justify-between gap-3 rounded-lg bg-violet-100 p-3 text-violet-600">
          <CalendarOff className="size-4" />
          <span className="flex-1">Holidays</span>
          <span>N/A</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-lime-100 p-3 text-lime-600">
          <CalendarDays className="size-4" />
          <span className="flex-1">Un-paid Leaves</span>
          <span>N/A</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-indigo-100 p-3 text-indigo-600">
          <CalendarDays className="size-4" />
          <span className="flex-1">Leave Encashment Days</span>
          <span>N/A</span>
        </div>
      </div>
    </div>
  );
}

export function PayslipDaysInfoSkeleton() {
  return (
    <div className="space-y-1.5 text-gray-600">
      <p className="text-base font-medium text-gray-600">Additional Info</p>
      <div className="grid grid-cols-4 gap-3 text-base">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-100 p-3 text-blue-600">
          <Calendar className="size-4" />
          <span className="flex-1">Calendar Days</span>
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-green-100 p-3 text-green-600">
          <HandCoins className="size-4" />
          <span className="flex-1">Days Payable</span>
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-orange-100 p-3 text-orange-600">
          <CalendarMinus className="size-4" />
          <span className="flex-1">LOP Days</span>
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-pink-100 p-3 text-pink-600">
          <CalendarCheck2 className="size-4" />
          <span className="flex-1">Present Days</span>
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-fuchsia-100 p-3 text-fuchsia-600">
          <CalendarDays className="size-4" />
          <span className="flex-1">Paid Leave Days</span>
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="rounded-mg flex items-center justify-between gap-3 rounded-lg bg-violet-100 p-3 text-violet-600">
          <CalendarOff className="size-4" />
          <span className="flex-1">Holidays</span>
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-lime-100 p-3 text-lime-600">
          <CalendarDays className="size-4" />
          <span className="flex-1">Un-paid Leaves</span>
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-indigo-100 p-3 text-indigo-600">
          <CalendarDays className="size-4" />
          <span className="flex-1">Leave Encashment Days</span>
          <Skeleton className="h-6 w-8" />
        </div>
      </div>
    </div>
  );
}
