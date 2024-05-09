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
import Image from "next/image";

const payslipDummyData = [
  {
    name: "Base Salary",
    amount: 8500,
    adjustment: -300,
    arrear: 100,
    amountPaid: 8300,
  },
  {
    name: "House Rent Allowance",
    amount: 8500,
    adjustment: -300,
    arrear: 100,
    amountPaid: 8300,
  },
  {
    name: "Medical Allowance",
    amount: 8500,
    adjustment: -300,
    arrear: 100,
    amountPaid: 8300,
  },
  {
    name: "Internet Allowance",
    amount: 8500,
    adjustment: -300,
    arrear: 100,
    amountPaid: 8300,
  },
];

export default function PayslipPdfTemplate() {
  return (
    <div id="main-pdf" className="flex h-full w-full flex-col gap-9 p-6 py-9">
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
            <p>Department:</p>
            <p>Designation:</p>
            <p>LOP Days:</p>
            <p>Onsite Salary Days:</p>
            <p>Leave Encashment:</p>
            <p>Holiday Allowance Days:</p>
            <p>Days Payable:</p>
          </div>
          <div>
            <p>EMP0001</p>
            <p>Shubham Mohanty</p>
            <p>U3</p>
            <p>IT Dept</p>
            <p>Junior Developer</p>
            <p>3</p>
            <p>26</p>
            <p>2</p>
            <p>1</p>
            <p>26</p>
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
            <p>PF Number:</p>
          </div>
          <div>
            <p>10/04/2024 to 31/04/2024</p>
            <p>10/04/2024</p>
            <p>Novafy Limited</p>
            <p>Novafy Mumbai Pl.No.4</p>
            <p>EBPWA2973K</p>
            <p>Federal Bank</p>
            <p>777456782123484</p>
            <p>INR</p>
            <p>TO</p>
            <p>Not Applicable</p>
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
            {payslipDummyData.map((payslipData, index) => (
              <TableRow key={index} className="h-12">
                <TableCell className="font-semibold">
                  {payslipData.name}
                </TableCell>
                <TableCell className="text-right">
                  {payslipData.amount}
                </TableCell>
                <TableCell className="text-right">
                  {payslipData.adjustment}
                </TableCell>
                <TableCell className="text-right">
                  {payslipData.arrear}
                </TableCell>
                <TableCell className="text-right">
                  {payslipData.amountPaid}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-semibold">Leave Encashment</TableCell>
              <TableCell className="text-right">834</TableCell>
              <TableCell className="text-right">-200</TableCell>
              <TableCell className="text-right">0</TableCell>
              <TableCell className="text-right">634</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow className="h-12">
              <TableCell colSpan={4} className="text-base font-semibold">
                Total Earnings
              </TableCell>
              <TableCell className="text-right text-base font-semibold">
                Rs. 18,000
              </TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption className="mt-6 font-semibold text-gray-900">
            Total earnings for April,2024 month is Rs.18,000
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
