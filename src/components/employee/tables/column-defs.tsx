import { format } from "date-fns";
// UTILS
import { cn, getBalancePeriod, getLeaveDateString } from "@/lib/utils";
// TYPES
import type {
  LeaveBalancesTableProps,
  LeaveApplicationTableProps,
  EmployeesDocumentsTableProps,
} from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { Badge } from "@/components/ui/badge";
// CUSTOM COMPONENTS
import DocumentsPreview from "@sharedComponents/documents-preview";
import { LeaveApplicationTableActions } from "./column-actions";

export const EMPLOYEE_DOCUMENTS_TABLE: ColumnDef<EmployeesDocumentsTableProps>[] =
  [
    {
      accessorKey: "documentType",
      header: "Document type",
      cell: ({ row }) => row.original.documentType.type,
    },
    {
      accessorKey: "documentFiles",
      header: "Document files",
      cell: ({ row }) => (
        <DocumentsPreview
          files={row.original.documentFiles}
          employee={row.original.employee}
          documentType={row.original.documentType}
        />
      ),
    },
    {
      accessorKey: "verified",
      header: "Verified",
    },
  ];

export const LEAVE_BALANCES_TABLE: ColumnDef<LeaveBalancesTableProps>[] = [
  {
    accessorKey: "leaveType",
    header: "Type",
    cell: ({ row }) => row.original.leaveType.type,
  },
  {
    accessorKey: "balance",
    header: "Balance",
  },
  {
    accessorKey: "balancePeriod",
    header: "Balance period",
    cell: ({ row }) => {
      const { createdAt, leaveType } = row.original;
      const balancePeriod = getBalancePeriod({
        renewPeriod: leaveType.renewPeriod,
        renewPeriodCount: leaveType.renewPeriodCount,
        referenceDate: createdAt,
      });

      return balancePeriod;
    },
  },
  {
    accessorKey: "carryOver",
    header: "Carry Over",
    cell: ({ row }) => (row.original.leaveType.carryOver ? "yes" : "no"),
  },
  {
    accessorKey: "paidLeave",
    header: "Paid leave",
    cell: ({ row }) => (row.original.leaveType.paidLeave ? "yes" : "no"),
  },
];

export const LEAVE_APPLICATION_TABLE: ColumnDef<LeaveApplicationTableProps>[] =
  [
    {
      accessorKey: "appliedOn",
      header: "Applied On",
      cell: ({ row }) => format(row.original.appliedOn, "do MMM yy"),
    },
    {
      accessorKey: "leaveDays",
      header: "Leave days",
    },
    {
      accessorKey: "leaveDate",
      header: "Leave Date",
      cell: ({ row }) =>
        getLeaveDateString({
          fromDate: row.original.fromDate,
          toDate: row.original.toDate,
          leaveDays: row.original.leaveDays,
          renewPeriod: row.original.leaveType.renewPeriod,
        }),
    },
    {
      accessorKey: "leaveType",
      header: "Leave type",
      cell: ({ row }) => row.original.leaveType.type,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            className={cn(
              status === "pending" && "bg-amber-500",
              status === "approved" && "bg-green-500",
              status === "rejected" && "bg-red-500",
              status === "withdrawn" && "bg-gray-500",
              "rounded-xl text-white",
            )}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reviewer",
      header: "Reviewer",
      cell: ({ row }) => row.original.reviewer.name,
    },
    {
      accessorKey: "withdraw",
      header: "Withdraw",
      cell: ({ row }) => (
        <LeaveApplicationTableActions
          id={row.original.id}
          status={row.original.status}
        />
      ),
    },
  ];
