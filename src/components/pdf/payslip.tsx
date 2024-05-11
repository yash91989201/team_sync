import Image from "next/image";
// UTILS
import { formatDate } from "@/lib/date-time-utils";
import { cn, formatSalary, getRenewPeriodRange } from "@/lib/utils";
// TYPES
import type { PayslipTemplateProps } from "@/lib/types";
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
} from "@/components/ui/table";
import { Separator } from "@ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// CUSTOM COMPONENTS
import { PdfPreviewWrapper } from "@/components/pdf";

export function PayslipPdfTemplate({
  payslipData,
  previewMode,
}: PayslipTemplateProps) {
  const { empData, empProfile, payslip, payslipComps, leaveEncashment } =
    payslipData;

  const { startDate: payPeriodStart, endDate: payPeriodEnd } =
    getRenewPeriodRange({
      referenceDate: payslip.date,
      renewPeriod: "month",
      renewPeriodCount: 1,
    });

  return (
    <div
      id="main-pdf"
      className={cn(
        "flex flex-col gap-9 p-6 py-9",
        previewMode ? "h-full w-full" : "h-screen w-screen",
      )}
    >
      <div className="mx-auto my-6 h-fit w-fit rounded-lg bg-primary/5 p-3">
        <div className="relative h-[4.5rem] w-96">
          <Image src="/novafy_logo_banner.png" alt="Novafy logo banner" fill />
        </div>
      </div>
      {/*  employee info */}
      <div className="flex items-center justify-between">
        {/* info 1 */}
        <section className="flex items-center gap-6">
          {/* info heading column */}
          <div className="font-semibold">
            <p>Employee Code:</p>
            <p>Employee Name:</p>
            <p>Employee Band:</p>
            <p>Designation:</p>
            <p>Department:</p>
            <p>Calendar Days:</p>
            <p>LOP Days:</p>
            <p>Leave Encashment Days:</p>
            <p>Holiday Allowance Days:</p>
            <p>Days Payable:</p>
            <p>Paid Leaves:</p>
            <p>Un-paid Leaves:</p>
          </div>
          <div>
            <p>{empData.code}</p>
            <p>{empData.name}</p>
            <p>{empProfile.empBand}</p>
            <p>{empProfile.designation.name}</p>
            <p>{empProfile.department.name}</p>
            <p>{payslip.calendarDays}</p>
            <p>{payslip.lopDays}</p>
            <p>{payslip.leaveEncashmentDays}</p>
            <p>{payslip.holidays}</p>
            <p>{payslip.daysPayable}</p>
            <p>{payslip.paidLeaveDays}</p>
            <p>{payslip.unPaidLeaveDays}</p>
          </div>
        </section>
        <Separator orientation="vertical" />
        {/* info 2 */}
        <section className="flex items-center gap-6">
          {/* info heading column */}
          <div className="font-semibold">
            <p>Pay Period:</p>
            <p>Hire Date:</p>
            <p>Pay Entity:</p>
            <p>Location:</p>
            <p>PAN:</p>
            <p>Bank:</p>
            <p>Bank A/C No:</p>
            <p>Currency:</p>
            <p>Arrears Period:</p>
            <p>ESI Number:</p>
            <p>PF Number:</p>
            <p>PF UAN Number:</p>
          </div>
          <div>
            <p>
              {formatDate(payPeriodStart, "dd/MM/yyyy")} to&nbsp;
              {formatDate(payPeriodEnd, "dd/MM/yyyy")}
            </p>
            <p>{formatDate(empProfile.joiningDate, "dd/MM/yyyy")}</p>
            <p>Novafy Limited</p>
            <p>Novafy Mumbai Pl.No.4</p>
            <p>EBPWA2973K</p>
            <p>Federal Bank</p>
            <p>777456782123484</p>
            <p>INR</p>
            <p>TO</p>
            <p>N/A</p>
            <p>N/A</p>
            <p>N/A</p>
          </div>
        </section>
      </div>
      <Separator />

      <main className="flex-1">
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
                <TableCell className="text-right">
                  {payslipComp.amount}
                </TableCell>
                <TableCell className="text-right">
                  {payslipComp.adjustment}
                </TableCell>
                <TableCell className="text-right">
                  {payslipComp.arrear}
                </TableCell>
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
            Total salary for {formatDate(payslip.date, "MMMM,yyyy")} month
            is&nbsp;
            {formatSalary(payslip.totalSalary)}.
          </TableCaption>
        </Table>
      </main>
      <footer className="border-t border-gray-600 p-6">
        <p className="text-center text-sm font-semibold">
          ***** This is electronically generated document hence does not require
          a signature *****
        </p>
      </footer>
    </div>
  );
}

export function NoPayslipData() {
  return (
    <PdfPreviewWrapper>
      <Card className="rounded-none border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Payslip PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Payslip with given id doesnot exists.</p>
        </CardContent>
      </Card>
    </PdfPreviewWrapper>
  );
}
