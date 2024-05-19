"use client";
import { lastDayOfMonth } from "date-fns";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { ReactNode } from "react";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Skeleton } from "@ui/skeleton";
// CUSTOM COMPONENTS
import GeneratePayslipForm from "./generate-payslip-form";
import { PayslipDataTable } from "@sharedComponents/payslip-data-table";
import { PayslipDaysInfoSkeleton } from "@sharedComponents/payslip-days-info";

export default function BulkGeneratePayslipForm({
  empId,
  employeeName,
  payslipStartDate,
}: {
  empId: string;
  employeeName: string;
  payslipStartDate: Date;
}) {
  const monthEnd = lastDayOfMonth(payslipStartDate);

  const {
    data: payslipData,
    isLoading: isPayslipLoading,
    isFetching: isPayslipFetching,
  } = api.payslipRouter.getMonthPayslip.useQuery(
    {
      empId,
      month: monthEnd,
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );

  const {
    data: createPayslipData,
    isLoading: isPayslipDataLoading,
    isFetching: isPayslipDataFetching,
  } = api.adminRouter.getCreatePayslipData.useQuery(
    {
      empId,
      startDate: payslipStartDate,
      endDate: monthEnd,
    },
    {
      enabled: payslipData?.status === "FAILED",
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const showSkeleton =
    isPayslipLoading ||
    isPayslipFetching ||
    isPayslipDataLoading ||
    isPayslipDataFetching;

  if (showSkeleton) {
    return (
      <GeneratePayslipCardWrapper employeeName={employeeName}>
        <GeneratePayslipFormSkeleton />
      </GeneratePayslipCardWrapper>
    );
  }

  return (
    <GeneratePayslipCardWrapper employeeName={employeeName}>
      {/* generate payslip form */}
      {payslipData &&
        (payslipData.status === "FAILED" ? (
          <GeneratePayslipForm
            empId={empId}
            date={monthEnd}
            payslipData={createPayslipData!}
          />
        ) : (
          <PayslipDataTable
            payslip={payslipData.data}
            date={payslipStartDate}
          />
        ))}
    </GeneratePayslipCardWrapper>
  );
}

const GeneratePayslipFormSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end ">
        <Skeleton className="h-9 w-40" />
      </div>
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

const GeneratePayslipCardWrapper = ({
  children,
  employeeName,
}: {
  children: ReactNode;
  employeeName: string;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-primary">
          Generate Payslip for {employeeName}
        </CardTitle>
        <CardDescription>Select a month and generate payslip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
};
