import { format } from "date-fns";
// UTILS
import { cn, getLeaveDateString } from "@/lib/utils";
// TYPES
import type {
  DepartmentTableProps,
  DesignationTableProps,
  DocumentTypeSchemaType,
  EmployeesDocumentsTableProps,
  EmployeesTableProps,
  LeaveRequestTableProps,
  LeaveTypeSchemaType,
  SalariesTableProps,
} from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
// CUSTOM COMPONENTS
import {
  DepartmentTableActions,
  DesignationTableActions,
  EmployeeTableActions,
  EmployeesDocumentsTableActions,
  LeaveRequestsTableActions,
  LeaveTypeTableActions,
  SalariesTableActions,
} from "./column-actions";
import DocumentsPreview from "@/components/shared/documents-preview";
import DeleteDocumentTypeForm from "@/components/admin/document-types/delete-document-type-form";
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
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => (
      <DepartmentTableActions id={row.original.id} name={row.original.name} />
    ),
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
  {
    accessorKey: "actions",
    cell: ({ row }) => (
      <DesignationTableActions
        id={row.original.id}
        name={row.original.name}
        deptId={row.original.deptId}
      />
    ),
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
          Leave days
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
    accessorKey: "leaveEncashment",
    header: "Leave Encashment",
    cell: ({ row }) => (row.original.leaveEncashment ? "yes" : "no"),
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => (
      <LeaveTypeTableActions id={row.original.id} type={row.original.type} />
    ),
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
  {
    accessorKey: "actions",
    cell: ({ row }) => (
      <DeleteDocumentTypeForm id={row.original.id} type={row.original.type} />
    ),
  },
];

export const EMPLOYEES_TABLE: ColumnDef<EmployeesTableProps>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14">
          <AvatarImage src={row.original.imageUrl!} alt={row.original.name} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <p>{row.original.name}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
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
      cell: ({ row }) => (row.original.verified ? "yes" : "no"),
    },
    {
      accessorKey: "actions",
      cell: ({ row }) => (
        <EmployeesDocumentsTableActions
          id={row.original.id}
          filesId={row.original.documentFiles.map(
            (documentFile) => documentFile.id,
          )}
        />
      ),
    },
  ];

export const LEAVE_REQUESTS_TABLE: ColumnDef<LeaveRequestTableProps>[] = [
  {
    accessorKey: "employee",
    header: "Applied by",
    cell: ({ row }) => row.original.employee.name,
  },
  {
    accessorKey: "leaveDays",
    header: "Leave days",
  },
  {
    accessorKey: "leaveDate",
    header: "Leave Date",
    cell: ({ row }) =>
      getLeaveDateString({
        fromDate: row.original.fromDate,
        toDate: row.original.toDate,
        leaveDays: row.original.leaveDays,
        renewPeriod: row.original.leaveType.renewPeriod,
      }),
  },
  {
    accessorKey: "leaveType",
    header: "Leave type",
    cell: ({ row }) => row.original.leaveType.type,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={cn(
            status === "pending" && "bg-amber-500",
            status === "approved" && "bg-green-500",
            status === "rejected" && "bg-red-500",
            status === "withdrawn" && "bg-gray-500",
            "rounded-xl text-white",
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "appliedOn",
    header: "Applied On",
    cell: ({ row }) => format(row.original.appliedOn, "do MMM yy"),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => row.original.reason ?? "Not given",
  },
  {
    accessorKey: "actions",
    header: "Accept / Reject",
    cell: ({ row }) => (
      <LeaveRequestsTableActions
        status={row.original.status}
        empId={row.original.employee.id}
        leaveRequestId={row.original.id}
      />
    ),
  },
];

export const SALARIES_TABLE: ColumnDef<SalariesTableProps>[] = [
  {
    accessorKey: "employeeName",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "employeeSalary",
    header: "Salary",
    cell: ({ row }) => row.original.employeeProfile?.salary,
  },
  {
    accessorKey: "actions",
    header: "Update Salary",
    cell: ({ row }) => <SalariesTableActions empId={row.original.id} />,
  },
];
