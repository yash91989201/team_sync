import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
// DB TABLES
import {
  adminProfileTable,
  departmentTable,
  designationTable,
  documentTypeTable,
  employeeAttendanceTable,
  employeeDocumentFileTable,
  employeeDocumentTable,
  employeeProfileTable,
  employeeShiftTable,
  leaveBalanceTable,
  leaveRequestTable,
  leaveTypeTable,
  userTable,
} from "@/server/db/schema";
// CONSTANTS
import { ACCEPTED_FILE_MIME_TYPES, MAX_FILE_SIZE } from "@/constants";

// Database table schemas
export const UserSchema = createSelectSchema(userTable);
export const EmployeeProfileSchema = createSelectSchema(employeeProfileTable);
export const AdminProfileSchema = createSelectSchema(adminProfileTable);
export const DepartmentSchema = createSelectSchema(departmentTable);
export const DesignationSchema = createSelectSchema(designationTable);
export const EmployeeShiftSchema = createSelectSchema(employeeShiftTable);
export const EmployeeAttendanceSchema = createSelectSchema(
  employeeAttendanceTable,
);
export const LeaveTypeSchema = createSelectSchema(leaveTypeTable);
export const LeaveRequestSchema = createSelectSchema(leaveRequestTable);
export const LeaveBalanceSchema = createSelectSchema(leaveBalanceTable);
export const DocumentTypeSchema=createSelectSchema(documentTypeTable)
export const EmployeeDocumentSchema=createSelectSchema(employeeDocumentTable)
export const EmployeeDocumentFileSchema=createSelectSchema(employeeDocumentFileTable)
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

// user profile image schemas
export const CreateProfileImageSchema = z.object({
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE.PROFILE_IMG,
      "Max image size is 5MB.",
    )
    .refine(
      (file) => ACCEPTED_FILE_MIME_TYPES.PROFILE_IMG.includes(file.type),
      "only .webp .jpg .png .svg files are accepted.",
    ),
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
  deptId: z.string(),
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
  dob: z.date(),
  location: z.string(),
  salary: z.number(),
  empBand: z.enum(["U1", "U2", "U3"]),
  shiftStart: z.date(),
  shiftEnd: z.date(),
  breakMinutes: z
    .number()
    .min(15, { message: "Min. break hours should be 15 min." }),
});

export const CreateEmployeeInputSchema = CreateEmployeeSchema.extend({
  imageUrl: z.string().nullable(),
});

export const CreateEmployeeFormSchema = CreateEmployeeSchema.extend({
  profileImage: z
    .instanceof(File, { message: "Employee Image is required." })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE.PROFILE_IMG,
      "Max image size is 5MB.",
    )
    .refine(
      (file) => ACCEPTED_FILE_MIME_TYPES.PROFILE_IMG.includes(file.type),
      "only .webp .jpg .png .svg files are accepted.",
    ),
});

export const AttendancePunchOutSchema = z.object({
  attendanceId: z.string(),
});

export const CreateLeaveTypeSchema = z.object({
  type: z
    .string()
    .min(4, { message: "Min. 4 letters is required." })
    .max(128, { message: "Max. 128 characters is allowed." }),
  daysAllowed: z.number(),
  renewPeriod: z.enum(["month", "year"]),
  renewPeriodCount: z.number(),
  carryOver: z.boolean(),
});

export const LeaveApplySchema = z.object({
  leaveTypeId: z.string().min(1, { message: "Select a leave type." }),
  leaveDate: z.object({
    from: z.date(),
    to: z.date(),
  }),
  leaveDays: z.number(),
  reviewerId: z.string().min(1, { message: "Select a reviwer." }),
  reason: z
    .string()
    .max(1024, { message: "Max. 1024 characters allowed." })
    .optional(),
});

export const ApproveLeaveSchema = z.object({
  leaveRequestId: z.string(),
});

export const RejectLeaveSchema = z.object({
  leaveRequestId: z.string(),
  empId: z.string(),
});
