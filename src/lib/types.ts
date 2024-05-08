// SCHEMAS
import type {
  // DB TABLES
  UserSchema,
  EmployeeProfileSchema,
  AdminProfileSchema,
  DepartmentSchema,
  DesignationSchema,
  EmployeeShiftSchema,
  EmployeeAttendanceSchema,
  LeaveTypeSchema,
  LeaveRequestSchema,
  LeaveBalanceSchema,
  DocumentTypeSchema,
  EmployeeDocumentSchema,
  EmployeeDocumentFileSchema,
  EmpPayslipSchema,
  EmpPayslipCompSchema,
  LeaveEncashmentSchema,
  // OTHER SCHEMAS
  AdminSignupSchema,
  LoginSchema,
  ResetPasswordSchema,
  NewVerificationSchema,
  CreateDepartmentSchema,
  CreateDesignationSchema,
  CreateEmployeeSchema,
  CreateLeaveTypeSchema,
  LeaveApplySchema,
  CreateProfileImageSchema,
  CreateEmployeeFormSchema,
  CreateEmployeeInputSchema,
  CreateDocumentTypeSchema,
  GetEmployeeByQueryInput,
  CreateEmployeeDocumentFormSchema,
  SalaryComponentSchema,
  EmployeeSalaryComponentSchema,
  CreateSalaryComponentSchema,
  UpdateEmployeeSchema,
  EmployeeLeaveTypeSchema,
  HolidaySchema,
  CreateHolidaySchema,
  UpdateHolidaySchema,
  UpdateDepartmentSchema,
  UpdateDesignationSchema,
  UpdateLeaveTypeSchema,
  UpdateEmployeeDocumentSchema,
  GeneratePayslipSchema,
} from "@/lib/schema";
// TYPES
import type { z } from "zod";
import type { Session } from "lucia";
import type { LucideIcon } from "lucide-react";
import type { AppRouter } from "@/server/api/root";
import type { inferProcedureOutput } from "@trpc/server";

// DB TABLE TYPES
export type UserType = Omit<z.infer<typeof UserSchema>, "password">;
export type EmployeeProfileType = z.infer<typeof EmployeeProfileSchema>;
export type AdminProfileType = z.infer<typeof AdminProfileSchema>;
export type DepartmentSchemaType = z.infer<typeof DepartmentSchema>;
export type DesignationSchemaType = z.infer<typeof DesignationSchema>;
export type EmployeeShiftType = z.infer<typeof EmployeeShiftSchema>;
export type EmployeeAttendanceType = z.infer<typeof EmployeeAttendanceSchema>;
export type LeaveTypeSchemaType = z.infer<typeof LeaveTypeSchema>;
export type EmployeeLeaveTypeSchemaType = z.infer<typeof EmployeeLeaveTypeSchema>
export type LeaveRequestSchemaType = z.infer<typeof LeaveRequestSchema>;
export type LeaveBalanceSchemaType = z.infer<typeof LeaveBalanceSchema>;
export type DocumentTypeSchemaType = z.infer<typeof DocumentTypeSchema>;
export type EmployeeDocumentSchemaType = z.infer<typeof EmployeeDocumentSchema>;
export type EmployeeDocumentFileSchemaType = z.infer<
  typeof EmployeeDocumentFileSchema
>;
export type SalaryComponentType = z.infer<typeof SalaryComponentSchema>
export type EmployeeSalaryComponentType = z.infer<typeof EmployeeSalaryComponentSchema>
export type HolidaySchemaType = z.infer<typeof HolidaySchema>
export type EmpPayslipType = z.infer<typeof EmpPayslipSchema>
export type EmpPayslipCompType = z.infer<typeof EmpPayslipCompSchema>
export type LeaveEncashmentType = z.infer<typeof LeaveEncashmentSchema>


export type ShiftType = Exclude<EmployeeAttendanceType["shift"], null>;

// AUTH TYPES
export type AdminSignupSchemaType = z.infer<typeof AdminSignupSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type NewVerificationSchemaType = z.infer<typeof NewVerificationSchema>;
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

// FORM TYPES
export type CreateDepartmentSchemaType = z.infer<typeof CreateDepartmentSchema>;
export type CreateDesignationSchemaType = z.infer<
  typeof CreateDesignationSchema
>;
export type GetEmployeeByQueryInputType = z.infer<
  typeof GetEmployeeByQueryInput
>;
export type CreateEmployeeSchemaType = z.infer<typeof CreateEmployeeSchema>;
export type CreateEmployeeFormSchemaType = z.infer<
  typeof CreateEmployeeFormSchema
>;
export type CreateEmployeeInputSchemaType = z.infer<
  typeof CreateEmployeeInputSchema
>;
export type CreateProfileImageSchemaType = z.infer<
  typeof CreateProfileImageSchema
>;
export type EmployeeDataForUpdateType = z.infer<typeof UpdateEmployeeSchema> & {
  name: string;
}
export type UpdateEmployeeSchemaType = z.infer<
  typeof UpdateEmployeeSchema
>;
export type CreateLeaveTypeSchemaType = z.infer<typeof CreateLeaveTypeSchema>;
export type UpdateLeaveTypeSchemaType = z.infer<typeof UpdateLeaveTypeSchema>
export type LeaveApplySchemaType = z.infer<typeof LeaveApplySchema>;
export type CreateDocumentTypeSchemaType = z.infer<
  typeof CreateDocumentTypeSchema
>;
export type CreateEmployeeDocumentFormSchemaType = z.infer<
  typeof CreateEmployeeDocumentFormSchema
>;
export type UpdateEmployeeDocumentSchemaType = z.infer<typeof UpdateEmployeeDocumentSchema>
export type UpdateEmployeeDocumentFormProps = EmployeeDocumentSchemaType & {
  employee: UserType;
  documentFiles: EmployeeDocumentFileSchemaType[];
  documentType: DocumentTypeSchemaType;
};
export type CreateSalaryComponentSchemaType = z.infer<typeof CreateSalaryComponentSchema>
export type UpdateDepartmentSchemaType = z.infer<typeof UpdateDepartmentSchema>
export type UpdateDesignationchemaType = z.infer<typeof UpdateDesignationSchema>
export type GetEmployeesSalariesOutputType = UserType & {
  employeeProfile: EmployeeProfileType | null
}
export type GeneratePayslipSchemaType = z.infer<typeof GeneratePayslipSchema>

// ADMIN DATA TABLE TYPES
export type EmployeesDocumentsTableProps = EmployeeDocumentSchemaType & {
  employee: UserType;
  documentType: DocumentTypeSchemaType;
  documentFiles: EmployeeDocumentFileSchemaType[];
};

export type DepartmentTableProps = DepartmentSchemaType & {
  employeeCount: number;
};

export type DesignationTableProps = DesignationSchemaType & {
  department: {
    name: string;
  };
};

export type LeaveRequestTableProps = LeaveRequestSchemaType & {
  employee: UserType;
  leaveType: LeaveTypeSchemaType
}

export type SalariesTableProps = GetEmployeesSalariesOutputType

// EMPLOYEE DATA TABLE TYPES
export type EmployeesTableProps = UserType & {
  employeeProfile: EmployeeProfileType & {
    department: DepartmentSchemaType | null;
    designation: DesignationSchemaType | null
  } | null
}

export type LeaveBalancesTableProps = LeaveBalanceSchemaType & {
  leaveType: LeaveTypeSchemaType;
};

export type LeaveApplicationTableProps = LeaveRequestSchemaType & {
  reviewer: UserType;
  leaveType: LeaveTypeSchemaType;
};

export type CreateHolidaySchemaType = z.infer<typeof CreateHolidaySchema>
export type UpdateHolidaySchemaType = z.infer<typeof UpdateHolidaySchema>

export type GeneratePayslipFormProps = {
  empId: string;
  date: Date;
  payslipData: inferProcedureOutput<
    AppRouter["adminRouter"]["getEmpPayslipData"]
  >;
};

export type PayslipTemplateProps = {
  payslip: EmpPayslipType;
  employee: UserType;
  payslipComps: EmpPayslipCompType[];
  leaveEncashment: LeaveEncashmentType
}

// OTHER TYPES
export type UserSessionType =
  | {
    user: UserType;
    session: Session;
  }
  | {
    user: null;
    session: null;
  };

export type NavLinkProps = {
  Icon: LucideIcon;
  label: string;
  href: string;
  matchExact: boolean;
  isNested: boolean;
  childrens?: NavLinkProps[];
  isChildLink: boolean;
};

// get employee data for update response
type GetEmployeeDataFailed = {
  status: "FAILED";
  message: string;
  error?: string;
}

type GetEmployeeDataSuccess = {
  status: "SUCCESS";
  message: string;
  data: EmployeeDataForUpdateType
}

export type GetEmployeeDataResponse = GetEmployeeDataFailed | GetEmployeeDataSuccess

export type LeaveApplicationType = LeaveRequestSchemaType & {
  leaveType: LeaveTypeSchemaType;
  reviewer: UserType;
};