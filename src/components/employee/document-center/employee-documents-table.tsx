"use client";
// UTILS
import { api } from "@/trpc/react";
// UI
import { DataTable } from "@sharedComponents/data-table";
// CONSTANTS
import { EMPLOYEE_DOCUMENTS_TABLE } from "@sharedComponents/data-table-column-defs";

export default function EmployeeDocumentsTable() {
  const { data = [] } = api.employeeRouter.getDocuments.useQuery();

  return <DataTable columns={EMPLOYEE_DOCUMENTS_TABLE} data={data} />;
}
