"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { LeaveTypeSchemaType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { Button } from "@/components/ui/button";
import { DataTable } from "@sharedComponents/data-table";
// ICONS
import { ArrowUpDown } from "lucide-react";

export default function LeaveTypeTable() {
  const { data = [] } = api.leaveRouter.getLeaveTypes.useQuery();

  return <DataTable columns={LEAVE_TABLE_COLUMNS} data={data} />;
}

const LEAVE_TABLE_COLUMNS: ColumnDef<LeaveTypeSchemaType>[] = [
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "daysAllowed",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-base font-semibold text-gray-700 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Days allowed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "renewPeriod",
    header: "Renews every",
    cell: ({ row }) =>
      row.original.renewPeriodCount > 1
        ? `${row.original.renewPeriodCount} ${row.original.renewPeriod}s`
        : row.original.renewPeriod,
  },
  {
    accessorKey: "carryOver",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-base font-semibold text-gray-700 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Carry over
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (row.original.carryOver ? "yes" : "no"),
  },
  {
    accessorKey: "paidLeave",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-base font-semibold text-gray-700 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Paid leave
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (row.original.paidLeave ? "yes" : "no"),
  },
];
