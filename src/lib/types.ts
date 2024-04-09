// SCHEMAS
import type {
  UserSchema,
  EmployeeProfileSchema,
  AdminProfileSchema,
  AdminSignupSchema,
  LoginSchema,
  ResetPasswordSchema,
  NewVerificationSchema,
  DepartmentSchema,
  CreateDepartmentSchema,
  DesignationSchema,
  CreateDesignationSchema,
  CreateEmployeeSchema,
  EmployeeShiftSchema,
  EmployeeAttendanceSchema,
  LeaveTypeSchema,
  LeaveRequestSchema,
  CreateLeaveTypeSchema,
  LeaveApplySchema,
  LeaveBalanceSchema,
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
export type CreateEmployeeSchemaType = z.infer<typeof CreateEmployeeSchema>;
export type CreateLeaveTypeSchemaType = z.infer<typeof CreateLeaveTypeSchema>;
export type LeaveApplySchemaType = z.infer<typeof LeaveApplySchema>;
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
