"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { SalaryComponentType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@/components/admin/data-table";

export default function SalaryComponentTable({
  initialData,
}: {
  initialData: SalaryComponentType[];
}) {
  const { data } = api.salaryRouter.getComponents.useQuery(undefined, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return <DataTable columns={DEPARTMENT_TABLE_COLUMNS} data={data} />;
}

const DEPARTMENT_TABLE_COLUMNS: ColumnDef<SalaryComponentType>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];
