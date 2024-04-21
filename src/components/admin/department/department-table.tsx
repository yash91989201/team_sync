"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { DepartmentType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@sharedComponents/data-table";

type DepartmentTableProps = DepartmentType & {
  employees: {
    empId: string;
    deptId: string;
    employeeCount: number;
  }[];
};

export default function DepartmentTable() {
  const { data = [] } = api.departmentRouter.getAll.useQuery();

  return <DataTable columns={DEPARTMENT_TABLE_COLUMNS} data={data} />;
}

const DEPARTMENT_TABLE_COLUMNS: ColumnDef<DepartmentTableProps>[] = [
  {
    accessorKey: "name",
    header: "name",
  },
  {
    accessorKey: "employeeCount",
    header: "employees",
    cell: ({ row }) =>
      row.original.employees.length === 0
        ? "0"
        : row.original.employees[0]?.employeeCount,
  },
];
