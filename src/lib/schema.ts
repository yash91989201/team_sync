import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
// SCHEMAS
import {
  adminProfileTable,
  employeeProfileTable,
  userTable,
} from "@/server/db/schema";

// Database table schemas
export const UserSchema = createSelectSchema(userTable);
export const EmployeeProfileSchema = createSelectSchema(employeeProfileTable);
export const AdminProfileSchema = createSelectSchema(adminProfileTable);

// Other schemas
export const AdminSignupSchema = z.object({
  name: z.string().min(6, { message: "Full name is required." }),
  email: z.string().email(),
  password: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  twoFactorCode: z.string().optional(),
});

export const NewVerificationSchema = z.object({
  token: z.string(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});
