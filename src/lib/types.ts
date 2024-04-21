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
  SalaryComponentsSchema,
  EmployeeSalaryComponentSchema,
  CreateSalaryComponentSchema,
} from "@/lib/schema";
// TYPES
import type { z } from "zod";
import type { Session } from "lucia";
import type { LucideIcon } from "lucide-react";

// DB TABLE TYPES
export type UserType = z.infer<typeof UserSchema>;
export type EmployeeProfileType = z.infer<typeof EmployeeProfileSchema>;
export type AdminProfileType = z.infer<typeof AdminProfileSchema>;
export type DepartmentType = z.infer<typeof DepartmentSchema>;
export type DesignationType = z.infer<typeof DesignationSchema>;
export type EmployeeShiftType = z.infer<typeof EmployeeShiftSchema>;
export type EmployeeAttendanceType = z.infer<typeof EmployeeAttendanceSchema>;
export type LeaveTypeSchemaType = z.infer<typeof LeaveTypeSchema>;
export type LeaveRequestSchemaType = z.infer<typeof LeaveRequestSchema>;
export type LeaveBalanceSchemaType = z.infer<typeof LeaveBalanceSchema>;
export type DocumentTypeSchemaType = z.infer<typeof DocumentTypeSchema>;
export type EmployeeDocumentSchemaType = z.infer<typeof EmployeeDocumentSchema>;
export type EmployeeDocumentFileSchemaType = z.infer<
  typeof EmployeeDocumentFileSchema
>;
export type SalaryComponentType = z.infer<typeof SalaryComponentsSchema>
export type EmployeeSalaryComponentType = z.infer<typeof EmployeeSalaryComponentSchema>

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
export type CreateLeaveTypeSchemaType = z.infer<typeof CreateLeaveTypeSchema>;
export type LeaveApplySchemaType = z.infer<typeof LeaveApplySchema>;
export type CreateDocumentTypeSchemaType = z.infer<
  typeof CreateDocumentTypeSchema
>;
export type CreateEmployeeDocumentFormSchemaType = z.infer<
  typeof CreateEmployeeDocumentFormSchema
>;
export type CreateSalaryComponentSchemaType = z.infer<typeof CreateSalaryComponentSchema>

// DATA TABLE TYPES
export type EmployeesDocumentsTableProps = EmployeeDocumentSchemaType & {
  employee: Omit<UserType, "password">;
  documentType: DocumentTypeSchemaType;
  documentFiles: EmployeeDocumentFileSchemaType[];
};

// OTHER TYPES
export type UserSessionType =
  | {
    user: Omit<UserType, "password">;
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
