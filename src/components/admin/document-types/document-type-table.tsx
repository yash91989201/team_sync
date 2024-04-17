"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { DocumentTypeSchemaType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@/components/admin/data-table";

export default function DocumentTypeTable({
  initialData,
}: {
  initialData: DocumentTypeSchemaType[];
}) {
  const { data = [] } = api.documentRouter.getTypes.useQuery(undefined, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return <DataTable columns={DOCUMENT_TYPE_COLUMNS} data={data} />;
}

const DOCUMENT_TYPE_COLUMNS: ColumnDef<DocumentTypeSchemaType>[] = [
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "fileType",
    header: "File type",
  },
  {
    accessorKey: "requiredFiles",
    header: "Required files",
  },
];
