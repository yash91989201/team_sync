"use client";
import Link from "next/link";
import { toast } from "sonner";
// UTILS
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/date-time-utils";
import { cn, formatSalary } from "@/lib/utils";
import { api } from "@/trpc/react";
// TYPES
import type { EmpPayslipType } from "@/lib/types";
// CUSTOM HOOKS
import useUser from "@/hooks/use-user";
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
import { Separator } from "@ui/separator";
import { Skeleton } from "@ui/skeleton";
// CUSTOM COMPONENTS
import {
  NoPayslipDaysInfo,
  PayslipDaysInfo,
  PayslipDaysInfoSkeleton,
} from "@sharedComponents/payslip-days-info";
// ICONS
import { Download, Eye, Trash2 } from "lucide-react";

export function PayslipDataTable({
  date,
  payslip,
}: {
  date: Date;
  payslip: EmpPayslipType;
}) {
  const { isAdmin } = useUser();
  const apiUtils = api.useUtils();

  const { data, isLoading, isFetching } =
    api.payslipRouter.getPayslipData.useQuery(
      {
        payslipId: payslip.id,
      },
      {
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    );

  const { mutateAsync: deleteEmpPayslip, isPending } =
    api.adminRouter.deleteEmpPayslip.useMutation();

  const deleteEmpPayslipAction = async (payslipId: string) => {
    const actionResponse = await deleteEmpPayslip({ payslipId });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);

      await apiUtils.payslipRouter.getMonthPayslip.invalidate({
        empId: payslip.empId,
        month: date,
      });
    } else {
      toast.error(actionResponse.message);
    }
  };

  if (isLoading || isFetching) {
    return <PayslipDataTableSkeleton />;
  }

  if (data === undefined || data?.status === "FAILED") {
    return <NoPayslipData />;
  }

  const { empData, payslipComps, leaveEncashment } = data.data;

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="h-12">
            <TableHead className="font-semibold text-gray-700">
              Salary Component
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700">
              Component Master
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700">
              Adjustment
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700">
              Arrear
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700">
              Amount Paid
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payslipComps.map((payslipComp, index) => (
            <TableRow key={index} className="h-12">
              <TableCell className="font-semibold">
                {payslipComp.name}
              </TableCell>
              <TableCell className="text-right">{payslipComp.amount}</TableCell>
              <TableCell className="text-right">
                {payslipComp.adjustment}
              </TableCell>
              <TableCell className="text-right">{payslipComp.arrear}</TableCell>
              <TableCell className="text-right">
                {payslipComp.amountPaid}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-semibold">Leave Encashment</TableCell>
            <TableCell className="text-right">
              {leaveEncashment.amount}
            </TableCell>
            <TableCell className="text-right">
              {leaveEncashment.adjustment}
            </TableCell>
            <TableCell className="text-right">
              {leaveEncashment.arrear}
            </TableCell>
            <TableCell className="text-right">
              {leaveEncashment.amountPaid}
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow className="h-12">
            <TableCell colSpan={4} className="text-base font-semibold">
              Total Earnings
            </TableCell>
            <TableCell className="text-right text-base font-semibold">
              {formatSalary(payslip.totalSalary)}
            </TableCell>
          </TableRow>
        </TableFooter>
        <TableCaption className="mt-6 font-semibold text-gray-900">
          Total earnings for {formatDate(payslip.date, "MMMM,yyyy")} month
          is&nbsp;
          {formatSalary(payslip.totalSalary)}.
        </TableCaption>
      </Table>
      <div className="flex items-center justify-end gap-3 text-lg font-medium">
        <Link
          target="_blank"
          href={payslip.pdfUrl}
          className={buttonVariants({
            size: "lg",
            variant: "outline",
            className: "gap-1.5",
          })}
        >
          <Eye className="size-4" />
          <span>Preview PDF</span>
        </Link>
        <Link
          className={buttonVariants({
            size: "lg",
            className: "gap-1.5",
          })}
          download={`${empData.name}'s ${formatDate(payslip.date, "MMMM-yyyy")} payslip`}
          target="_blank"
          href={payslip.pdfUrl}
        >
          <Download className="size-4" />
          <span>Payslip PDF</span>
        </Link>
      </div>
      <PayslipDaysInfo {...payslip} />
      {isAdmin ? (
        <div className="flex flex-col gap-3">
          <Separator />
          <Button
            size="lg"
            variant="destructive"
            className="w-fit gap-1.5"
            onClick={() => deleteEmpPayslipAction(payslip.id)}
          >
            <Trash2 className={cn("size-4", isPending && "animate-bounce")} />
            <span>Delete Payslip</span>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export const PayslipDataTableSkeleton = () => {
  const { isAdmin } = useUser();

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
      <div className="flex items-center justify-end gap-3">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
      <PayslipDaysInfoSkeleton />
      {isAdmin ? (
        <div className="flex flex-col gap-3">
          <Separator />
          <Skeleton className="h-10 w-48" />
        </div>
      ) : null}
    </div>
  );
};

export const NoPayslipData = () => {
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
          <TableRow className="h-72">
            <TableCell
              colSpan={6}
              className="text-center text-base font-medium text-gray-500"
            >
              No payslip data available for this month.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <NoPayslipDaysInfo />
    </div>
  );
};
