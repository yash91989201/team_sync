"use client";
// UTILS
import { api } from "@/trpc/react";
import { getBalancePeriod } from "@/lib/utils";
// TYPES
import type { ColumnDef } from "@tanstack/react-table";
import type { LeaveTypeSchemaType, LeaveBalanceSchemaType } from "@/lib/types";
// UI
import { DataTable } from "@/components/admin/data-table";

type LeaveBalancesTableProps = LeaveBalanceSchemaType & {
  leaveType: LeaveTypeSchemaType;
};

export default function LeaveBalancesTable() {
  // const { data = [] } = api.employeeRouter.getLeaveApplications.useQuery();
  const { data = [] } = api.leaveRouter.getLeaveBalances.useQuery();

  return <DataTable columns={DEPARTMENT_TABLE_COLUMNS} data={data} />;
}

const DEPARTMENT_TABLE_COLUMNS: ColumnDef<LeaveBalancesTableProps>[] = [
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
