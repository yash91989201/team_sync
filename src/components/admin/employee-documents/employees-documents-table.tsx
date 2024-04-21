"use client";
// UTILS
import { api } from "@/trpc/react";
// UI
import { DataTable } from "@sharedComponents/data-table";
// CONSTANTS
import { EMPLOYEES_DOCUMENTS_TABLE } from "@sharedComponents/data-table-column-defs";

export default function EmployeesDocumentsTable() {
  const { data = [] } = api.documentRouter.getEmployeesDocuments.useQuery();

  return <DataTable columns={EMPLOYEES_DOCUMENTS_TABLE} data={data} />;
}
