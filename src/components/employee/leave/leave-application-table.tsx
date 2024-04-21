"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type {
  UserType,
  LeaveTypeSchemaType,
  LeaveRequestSchemaType,
} from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@sharedComponents/data-table";

type LeaveApplicationTableProps = LeaveRequestSchemaType & {
  reviewer: Omit<UserType, "password">;
  leaveType: LeaveTypeSchemaType;
};

export default function LeaveApplicationTable() {
  const { data = [] } = api.employeeRouter.getLeaveApplications.useQuery();

  return <DataTable columns={DEPARTMENT_TABLE_COLUMNS} data={data} />;
}

const DEPARTMENT_TABLE_COLUMNS: ColumnDef<LeaveApplicationTableProps>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
];
