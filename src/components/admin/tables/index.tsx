"use client";
// UTILS
import { api } from "@/trpc/react";
// COMPONENTS
import { DataTable } from "@sharedComponents/data-table";
// CONSTANTS
import {
  DEPARTMENT_TABLE,
  DESIGNATION_TABLE,
  DOCUMENT_TYPE_TABLE,
  EMPLOYEES_DOCUMENTS_TABLE,
  EMPLOYEES_TABLE,
  LEAVE_REQUESTS_TABLE,
  LEAVE_TYPE_TABLE,
  SALARIES_TABLE,
} from "./column-defs";

export function DepartmentTable() {
  const { data = [] } = api.departmentRouter.getAll.useQuery();

  return <DataTable columns={DEPARTMENT_TABLE} data={data} />;
}

export function DesignationTable() {
  const { data = [] } = api.designationRouter.getAll.useQuery();

  return <DataTable columns={DESIGNATION_TABLE} data={data} />;
}

export function LeaveTypeTable() {
  const { data = [] } = api.leaveRouter.getLeaveTypes.useQuery();

  return <DataTable columns={LEAVE_TYPE_TABLE} data={data} />;
}

export function DocumentTypeTable() {
  const { data = [] } = api.documentRouter.getTypes.useQuery();

  return <DataTable columns={DOCUMENT_TYPE_TABLE} data={data} />;
}

export function EmployeesTable() {
  const { data = [] } = api.employeeRouter.getAll.useQuery();

  return <DataTable columns={EMPLOYEES_TABLE} data={data} />;
}

export function LeaveRequestsTable() {
  const { data = [] } = api.leaveRouter.getLeaveRequests.useQuery();

  return <DataTable columns={LEAVE_REQUESTS_TABLE} data={data} />;
}

export function EmployeesDocumentsTable() {
  const { data = [] } = api.documentRouter.getEmployeesDocuments.useQuery();

  return <DataTable columns={EMPLOYEES_DOCUMENTS_TABLE} data={data} />;
}

export function SalariesTable() {
  const { data = [] } = api.adminRouter.getEmployeesSalaries.useQuery();

  return <DataTable columns={SALARIES_TABLE} data={data} />;
}
