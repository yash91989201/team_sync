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
export const DocumentTypeSchema = createSelectSchema(documentTypeTable);
export const EmployeeDocumentSchema = createSelectSchema(employeeDocumentTable);
export const EmployeeDocumentFileSchema = createSelectSchema(
  employeeDocumentFileTable,
);
// AUTH SCHEMAS
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

// USER SCHEMAS
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

// DEPARTMENT SCHEMAS
export const CreateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Min. allowed length is 4" })
    .max(128, { message: "Max. allowed length is 128" }),
});

// DESIGNATION SCHEMAS
export const CreateDesignationSchema = z.object({
  name: z
    .string({ required_error: "Designation is required." })
    .min(6, { message: "Min. required length is 6" })
    .max(64, { message: "Max. allowed length is 64" }),
  deptId: z
    .string({ required_error: "Department is required." })
    .min(1, { message: "Select a department" }),
});

// DOCUMENT SCHEMAS
export const CreateDocumentTypeSchema = DocumentTypeSchema.extend({
  type: z.string().min(4, { message: "Min. required length is 4" }),
});

export const CreateEmployeeDocumentFormSchema = z.object({
  id: z.string(),
  empId: z.string(),
  documentTypeId: z.string(),
  documentType: DocumentTypeSchema,
  uniqueDocumentId: z.string().optional(),
  verified: z.boolean(),
  // document list
  documents: z.array(z.object({
    id: z.string(),
    file: z
      .instanceof(File, { message: "File is required." })
      .refine(
        (file) => file.size <= MAX_FILE_SIZE.PROFILE_IMG,
        "Max image size is 5MB.",
      )
  }))
}).refine((schema) => schema.documents.length === schema.documentType.requiredFiles,
  (schema) => ({ message: `Exactly ${schema.documentType.requiredFiles} files are required.`, path: ["documents"] }))

export const CreateEmployeeDocumentInputSchema = z.object({
  id: z.string(),
  empId: z.string(),
  documentTypeId: z.string(),
  uniqueDocumentId: z.string().optional(),
  verified: z.boolean().default(false),
  documentFiles: z.array(z.object({
    id: z.string(),
    fileUrl: z.string().url(),
    empDocumentId: z.string(),
  }))
})

// EMPLOYEE SCHEMAS
export const GetEmployeeByQueryInput = z.object({ query: z.string() });

export const CreateEmployeeSchema = z.object({
  code: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.literal("EMPLOYEE"),
  isTeamLead: z.boolean(),
  joiningDate: z.date({ required_error: "Joining date is required." }),
  deptId: z.string(),
  designationId: z.string(),
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

// EMPLOYEE ATTENDANCE SCHEMAS
export const AttendancePunchOutSchema = z.object({
  attendanceId: z.string(),
});

// EMPLOYEE LEAVE SCHEMAS
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
