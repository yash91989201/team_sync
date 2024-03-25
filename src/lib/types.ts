import type { z } from "zod";
import type { Session } from "lucia";
// SCHEMAS
import type {
  UserSchema,
  EmployeeProfileSchema,
  AdminProfileSchema,
  AdminSignupSchema,
  LoginSchema,
  ResetPasswordSchema,
  NewVerificationSchema,
} from "@/lib/schema";

// DB TABLE TYPES
export type UserType = z.infer<typeof UserSchema>;
export type EmployeeProfileType = z.infer<typeof EmployeeProfileSchema>;
export type AdminProfileType = z.infer<typeof AdminProfileSchema>;
// OTHER TYPES
export type AdminSignupSchemaType = z.infer<typeof AdminSignupSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type NewVerificationSchemaType = z.infer<typeof NewVerificationSchema>;
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
export type UserSessionType =
  | {
    user: Omit<UserType, "password">;
    session: Session;
  }
  | {
    user: null;
    session: null;
  };
