"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { SalaryComponentType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@sharedComponents/data-table";

export default function SalaryComponentTable() {
  const { data = [] } = api.salaryRouter.getComponents.useQuery();

  return <DataTable columns={DEPARTMENT_TABLE_COLUMNS} data={data} />;
}

const DEPARTMENT_TABLE_COLUMNS: ColumnDef<SalaryComponentType>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];
