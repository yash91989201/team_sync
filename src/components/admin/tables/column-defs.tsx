import Link from "next/link";
import { format } from "date-fns";
// UTILS
import { cn, getLeaveDateString, getShiftTimeString } from "@/lib/utils";
// TYPES
import type {
  DepartmentTableProps,
  DesignationTableProps,
  DocumentTypeSchemaType,
  EmpShiftTableProps,
  EmployeesDocumentsTableProps,
  EmployeesTableProps,
  EmpsAttendanceStatType,
  LeaveRequestTableProps,
  LeaveTypeSchemaType,
  SalariesTableProps,
} from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
// UI
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import DocumentsPreview from "@sharedComponents/documents-preview";
import DeleteDocumentTypeForm from "@adminComponents/document-types/delete-document-type-form";
// CONSTANTS
import { DOCUMENT_FILE_TYPES_DISPLAY } from "@/constants";
// ICONS
import { ArrowUpDown, CornerUpRight } from "lucide-react";

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
    accessorKey: "employeeImage",
    header: "",
    cell: ({ row }) => (
      <Avatar className="h-14 w-14">
        <AvatarImage src={row.original.imageUrl!} alt={row.original.name} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "employeeDesignation",
    header: "Designation",
    cell: ({ row }) => {
      const employeeProfile = row.original.employeeProfile;
      return employeeProfile?.designation?.name;
    },
  },
  {
    accessorKey: "employeeDepartment",
    header: "Department",
    cell: ({ row }) => {
      const employeeProfile = row.original.employeeProfile;
      return employeeProfile?.department?.name;
    },
  },
  {
    accessorKey: "joiningDate",
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
  {
    accessorKey: "payslip",
    header: "Generate Payslip",
    cell: ({ row }) => (
      <Link
        className={cn(
          buttonVariants({
            size: "icon",
            variant: "outline",
            className:
              "rounded-xl  text-green-500  hover:border-green-500 hover:bg-white hover:text-green-500",
          }),
          "border-green-500 ",
        )}
        href={`/admin/payroll/salary-info/${row.original.id}/generate-payslip`}
      >
        <CornerUpRight className="size-4" />
      </Link>
    ),
  },
];

export const EMP_SHIFT_TABLE: ColumnDef<EmpShiftTableProps>[] = [
  {
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }) => row.original.employee.name,
  },
  {
    accessorKey: "punchIn",
    header: "Punch-in time",
    cell: ({ row }) => getShiftTimeString(row.original.punchIn),
  },
  {
    accessorKey: "punchOut",
    header: "Punch-out time",
    cell: ({ row }) => {
      return row.original.punchOut === null
        ? "N/A"
        : getShiftTimeString(row.original.punchOut);
    },
  },
  {
    accessorKey: "shift",
    header: "Shift",
    cell: ({ row }) => row.original.shift ?? "N/A",
  },
  {
    accessorKey: "hours",
    header: "Working hours",
    cell: ({ row }) => row.original.hours ?? "N/A",
  },
];

export const EMP_ATTENDANCE_STAT_TABLE: ColumnDef<EmpsAttendanceStatType>[] = [
  {
    accessorKey: "name",
    header: "Employee",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "workHours",
    header: "Total work hours",
  },
  {
    accessorKey: "workDays",
    header: "Working Days",
  },
  {
    accessorKey: "holidays",
    header: "Holidays",
  },
  {
    accessorKey: "approvedLeaves",
    header: "Approved Leaves",
  },
  {
    accessorKey: "rejectedLeaves",
    header: "Rejected Leaves",
  },
  {
    accessorKey: "paidLeaves",
    header: "Paid Leaves",
  },
  {
    accessorKey: "unPaidLeaves",
    header: "Un-paid Leaves",
  },
];
