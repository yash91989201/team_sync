import { format } from "date-fns";
// TYPES
import type {
  DepartmentTableProps,
  DesignationTableProps,
  DocumentTypeSchemaType,
  EmployeesDocumentsTableProps,
  EmployeesTableProps,
  LeaveTypeSchemaType,
} from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { Button } from "@/components/ui/button";
// CUSTOM COMPONENTS
import { EmployeeTableActions, LeaveTypeTableActions } from "./column-actions";
import DocumentsPreview from "@/components/shared/documents-preview";
// CONSTANTS
import { DOCUMENT_FILE_TYPES_DISPLAY } from "@/constants";
// ICONS
import { ArrowUpDown } from "lucide-react";

export const DEPARTMENT_TABLE: ColumnDef<DepartmentTableProps>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "employeeCount",
    header: "Employees",
    cell: ({ row }) =>
      row.original.employees.length === 0
        ? "0"
        : row.original.employees[0]?.employeeCount,
  },
];

export const DESIGNATION_TABLE: ColumnDef<DesignationTableProps>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "Department",
    header: "Department",
    cell: ({ row }) => row.original.department.name,
  },
];

export const LEAVE_TYPE_TABLE: ColumnDef<LeaveTypeSchemaType>[] = [
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "daysAllowed",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-base font-semibold text-gray-700 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Days allowed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "renewPeriod",
    header: "Renews every",
    cell: ({ row }) =>
      row.original.renewPeriodCount > 1
        ? `${row.original.renewPeriodCount} ${row.original.renewPeriod}s`
        : row.original.renewPeriod,
  },
  {
    accessorKey: "carryOver",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-base font-semibold text-gray-700 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Carry over
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (row.original.carryOver ? "yes" : "no"),
  },
  {
    accessorKey: "paidLeave",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-base font-semibold text-gray-700 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Paid leave
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (row.original.paidLeave ? "yes" : "no"),
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => <LeaveTypeTableActions id={row.original.id} />,
  },
];

export const DOCUMENT_TYPE_TABLE: ColumnDef<DocumentTypeSchemaType>[] = [
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

export const EMPLOYEES_TABLE: ColumnDef<EmployeesTableProps>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "employeeProfile",
    header: "Designation",
    cell: ({ row }) => {
      const employeeProfile = row.original.employeeProfile;
      return employeeProfile?.designation?.name;
    },
  },
  {
    accessorKey: "employeeProfile",
    header: "Department",
    cell: ({ row }) => {
      const employeeProfile = row.original.employeeProfile;
      return employeeProfile?.department?.name;
    },
  },
  {
    accessorKey: "employeeProfile",
    header: "Joining date",
    cell: ({ row }) => {
      const employeeProfile = row.original.employeeProfile;
      if (employeeProfile === null) return "";
      return format(employeeProfile.joiningDate, "do MMM, yyyy");
    },
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => <EmployeeTableActions empId={row.original.id} />,
  },
];

export const EMPLOYEES_DOCUMENTS_TABLE: ColumnDef<EmployeesDocumentsTableProps>[] =
  [
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
        <DocumentsPreview
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
