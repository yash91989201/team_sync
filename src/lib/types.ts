import type { z } from "zod";
import type { Session } from "lucia";
import type { LucideIcon } from "lucide-react";
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
} from "@/lib/schema";

// DB TABLE TYPES
export type UserType = z.infer<typeof UserSchema>;
export type EmployeeProfileType = z.infer<typeof EmployeeProfileSchema>;
export type AdminProfileType = z.infer<typeof AdminProfileSchema>;
export type DepartmentType = z.infer<typeof DepartmentSchema>;
// AUTH TYPES
export type AdminSignupSchemaType = z.infer<typeof AdminSignupSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type NewVerificationSchemaType = z.infer<typeof NewVerificationSchema>;
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
// FORM TYPES
export type CreateDepartmentSchemaType = z.infer<typeof CreateDepartmentSchema>;
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
};
