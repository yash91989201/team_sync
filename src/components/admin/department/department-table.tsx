"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { DepartmentType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@/components/admin/data-table";

export default function DepartmentTable({
  initialData,
}: {
  initialData: Awaited<DepartmentType[]>;
}) {
  const { data } = api.departmentRouter.getAll.useQuery(undefined, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return <DataTable columns={DEPARTMENT_TABLE_COLUMNS} data={data} />;
}

const DEPARTMENT_TABLE_COLUMNS: ColumnDef<DepartmentType>[] = [
  {
    accessorKey: "name",
    header: "name",
  },
];
