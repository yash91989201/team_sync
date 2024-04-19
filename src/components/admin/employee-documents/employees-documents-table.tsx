"use client";
// UTILS
import { api } from "@/trpc/react";
// TYPES
import type {
  UserType,
  DocumentTypeSchemaType,
  EmployeeDocumentSchemaType,
  EmployeeDocumentFileSchemaType,
} from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { DataTable } from "@/components/admin/data-table";
// CUSTOM COMPONENTS
import FilesPreview from "@/components/admin/employee-documents/files-preview";

type EmployeesDocumentsTableProps = EmployeeDocumentSchemaType & {
  employee: Omit<UserType, "password">;
  documentType: DocumentTypeSchemaType;
  documentFiles: EmployeeDocumentFileSchemaType[];
};

export default function EmployeesDocumentsTable() {
  const { data = [] } = api.documentRouter.getEmployeesDocuments.useQuery();

  return <DataTable columns={DOCUMENT_TYPE_COLUMNS} data={data} />;
}

const DOCUMENT_TYPE_COLUMNS: ColumnDef<EmployeesDocumentsTableProps>[] = [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => row.original.employee.name,
  },
  {
    accessorKey: "documentType",
    header: "Document type",
    cell: ({ row }) => row.original.documentType.type,
  },
  {
    accessorKey: "documentFiles",
    header: "Document files",
    cell: ({ row }) => (
      <FilesPreview
        files={row.original.documentFiles}
        employee={row.original.employee}
        documentType={row.original.documentType}
      />
    ),
  },
  {
    accessorKey: "verified",
    header: "Verified",
  },
];
