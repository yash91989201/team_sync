"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type { DocumentTypeSchemaType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@sharedComponents/data-table";
import { DOCUMENT_FILE_TYPES_DISPLAY } from "@/constants";

export default function DocumentTypeTable() {
  const { data = [] } = api.documentRouter.getTypes.useQuery();

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
    cell: ({ row }) => DOCUMENT_FILE_TYPES_DISPLAY[row.original.fileType],
  },
  {
    accessorKey: "requiredFiles",
    header: "Required files",
  },
];
