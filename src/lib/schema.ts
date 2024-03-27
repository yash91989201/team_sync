import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
// SCHEMAS
import {
  adminProfileTable,
  departmentTable,
  designationTable,
  employeeProfileTable,
  userTable,
} from "@/server/db/schema";

// Database table schemas
export const UserSchema = createSelectSchema(userTable);
export const EmployeeProfileSchema = createSelectSchema(employeeProfileTable);
export const AdminProfileSchema = createSelectSchema(adminProfileTable);
export const DepartmentSchema = createSelectSchema(departmentTable);
export const DesignationSchema = createSelectSchema(designationTable);

// Auth schemas
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

// department schemas
export const CreateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Min. allowed length is 2." })
    .max(128, { message: "Max. allowed length is 128." }),
});

// designation schemas
export const CreateDesignationSchema = z.object({
  name: z
    .string()
    .min(6, { message: "Min. allowed length is 6." })
    .max(64, { message: "Max. allowed length is 64." }),
});

// employee schemas
export const CreateEmployeeSchema = z.object({
  code: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.literal("EMPLOYEE"),
  isTeamLead: z.boolean(),
  joiningDate: z.date({ required_error: "Joining date is required." }),
  dept: z.string(),
  designation: z.string(),
  paidLeaves: z.number(),
  location: z.string(),
  salary: z.number(),
  empBand: z.enum(["U1", "U2", "U3"]),
});
