"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { DesignationType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@/components/admin/data-table";

type DesignationTableProps = DesignationType & {
  department: {
    name: string;
  };
};

export default function DesignationTable({
  initialData,
}: {
  initialData: DesignationTableProps[];
}) {
  const { data } = api.designationRouter.getAll.useQuery(undefined, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return <DataTable columns={DESIGNATION_TABLE_COLUMNS} data={data} />;
}

const DESIGNATION_TABLE_COLUMNS: ColumnDef<DesignationTableProps>[] = [
  {
    accessorKey: "name",
    header: "name",
  },
  {
    accessorKey: "Department",
    header: "Department",
    cell: ({ row }) => row.original.department.name,
  },
];
