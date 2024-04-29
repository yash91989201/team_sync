"use client";
// UTILS
import { api } from "@/trpc/react";
// UI
import { DataTable } from "@/components/shared/data-table";
// CUSTOM COMPONENTS
import {
  LEAVE_BALANCES_TABLE,
  LEAVE_APPLICATION_TABLE,
  EMPLOYEE_DOCUMENTS_TABLE,
} from "./column-defs";

export function EmployeeDocumentsTable() {
  const { data = [] } = api.employeeRouter.getDocuments.useQuery();

  return <DataTable columns={EMPLOYEE_DOCUMENTS_TABLE} data={data} />;
}

export function LeaveBalancesTable() {
  const { data = [] } = api.leaveRouter.getLeaveBalances.useQuery();

  return <DataTable columns={LEAVE_BALANCES_TABLE} data={data} />;
}

export function LeaveApplicationTable() {
  const { data = [] } = api.employeeRouter.getLeaveApplications.useQuery();

  return <DataTable columns={LEAVE_APPLICATION_TABLE} data={data} />;
}
