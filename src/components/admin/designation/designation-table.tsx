"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { DesignationType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@/components/admin/data-table";

export default function DesignationTable({
  initialData,
}: {
  initialData: Awaited<DesignationType[]>;
}) {
  const { data } = api.designationRouter.getAll.useQuery(undefined, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return <DataTable columns={DESIGNATION_TABLE_COLUMNS} data={data} />;
}

const DESIGNATION_TABLE_COLUMNS: ColumnDef<DesignationType>[] = [
  {
    accessorKey: "name",
    header: "name",
  },
];
