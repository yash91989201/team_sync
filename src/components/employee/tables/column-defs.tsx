// UTILS
import { getBalancePeriod } from "@/lib/utils";
// TYPES
import type {
  LeaveBalancesTableProps,
  LeaveApplicationTableProps,
  EmployeesDocumentsTableProps,
} from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// CUSTOM COMPONENTS
import DocumentsPreview from "@sharedComponents/documents-preview";

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
      accessorKey: "status",
      header: "Status",
    },
  ];
