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
  employeeLeaveTypeTable,
  employeeProfileTable,
  employeeSalaryComponentTable,
  employeeShiftTable,
  holidayTable,
  leaveBalanceTable,
  leaveRequestTable,
  leaveTypeTable,
  salaryComponentTable,
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
export const EmployeeLeaveTypeSchema = createSelectSchema(employeeLeaveTypeTable)
export const LeaveRequestSchema = createSelectSchema(leaveRequestTable);
export const LeaveBalanceSchema = createSelectSchema(leaveBalanceTable);
export const DocumentTypeSchema = createSelectSchema(documentTypeTable);
export const EmployeeDocumentSchema = createSelectSchema(employeeDocumentTable);
export const EmployeeDocumentFileSchema = createSelectSchema(
  employeeDocumentFileTable,
);
export const SalaryComponentsSchema = createSelectSchema(salaryComponentTable)
export const EmployeeSalaryComponentSchema = createSelectSchema(employeeSalaryComponentTable)
export const HolidaySchema = createSelectSchema(holidayTable)
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
    .min(4, { message: "Min. allowed length is 4" })
    .max(128, { message: "Max. allowed length is 128" }),
});

export const UpdateDepartmentSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(4, { message: "Min. allowed length is 4" })
    .max(128, { message: "Max. allowed length is 128" }),
})

export const DeleteDepartmentSchema = z.object({
  id: z.string(),
})

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

export const UpdateDesignationSchema = z.object({
  id: z.string(),
  deptId: z.string(),
  name: z
    .string({ required_error: "Designation is required." })
    .min(6, { message: "Min. required length is 6" })
    .max(64, { message: "Max. allowed length is 64" }),
});

export const DeleteDesignationSchema = z.object({
  id: z.string(),
  deptId: z.string(),
})

// DOCUMENT SCHEMAS
export const CreateDocumentTypeSchema = DocumentTypeSchema.extend({
  type: z.string({ required_error: "Document type is required." }).min(4, { message: "Min. required length is 4" }),
});

export const DeleteDocumentTypeSchema = z.object({
  id: z.string()
})

export const DeleteEmployeeDocumentSchema = z.object({
  id: z.string(),
  filesId: z.array(z.string())
})

export const GetEmployeeDocumentsInput = z.object({
  id: z.string()
})

export const CreateEmployeeDocumentFormSchema = z.object({
  id: z.string(),
  empId: z.string({ required_error: "Employee is required" }),
  documentTypeId: z.string(),
  documentType: DocumentTypeSchema,
  uniqueDocumentId: z.string().optional(),
  verified: z.boolean(),
  // files
  files: z.array(z.instanceof(File))
})

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

export const UpdateEmployeeDocumentSchema = z.object({
  id: z.string(),
  uniqueDocumentId: z.string().optional(),
  verified: z.boolean().default(false),
})

// EMPLOYEE SCHEMAS
export const GetEmployeeByQueryInput = z.object({ query: z.string() });
export const GetEmployeeByIdInput = z.object({ empId: z.string() })

export const CreateEmployeeSchema = z.object({
  code: z.string({ required_error: "Employee code is required" }).min(4, { message: "Min. 4 characters is required" }),
  name: z.string({ required_error: "Employee name is required" }).min(6, { message: "Full name is required" }),
  email: z.string().email(),
  password: z.string(),
  role: z.literal("EMPLOYEE"),
  isTeamLead: z.boolean(),
  joiningDate: z.date({ required_error: "Joining date is required" }),
  deptId: z.string({ required_error: "Department is required" }),
  designationId: z.string({ required_error: "Designation is required" }),
  dob: z.date(),
  location: z.string(),
  salary: z.number(),
  empBand: z.enum(["U1", "U2", "U3"]),
  shiftStart: z.date(),
  shiftEnd: z.date(),
  breakMinutes: z
    .number()
    .min(15, { message: "Min. break hours should be 15 min." }),
  salaryComponents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    amount: z.number()
  })).min(1, {
    message: "Min. 1 salary component is required"
  }),
  leaveTypes: z.array(LeaveTypeSchema).min(1, { message: "Min. 1 leave type is required." })
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

export const UpdateEmployeeSchema = z.object({
  empId: z.string(),
  code: z.string({ required_error: "Employee code is required" }).min(4, { message: "Min. 4 characters is required" }),
  isTeamLead: z.boolean(),
  joiningDate: z.date({ required_error: "Joining date is required" }),
  deptId: z.string({ required_error: "Department is required" }),
  designationId: z.string({ required_error: "Designation is required" }),
  location: z.string(),
  salary: z.number(),
  empBand: z.enum(["U1", "U2", "U3"]),
  shiftStart: z.date(),
  shiftEnd: z.date(),
  breakMinutes: z
    .number()
    .min(15, { message: "Min. break hours should be 15 min." }),
  salaryComponents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    amount: z.number()
  })).min(1, {
    message: "Min. 1 salary component is required"
  }),
  leaveTypes: z.array(LeaveTypeSchema).min(1, { message: "Min. 1 leave type is required." })
});

export const DeleteEmployeeSchema = z.object({
  empId: z.string()
})

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
  carryOver: z.boolean().default(false),
  paidLeave: z.boolean().default(false),
  leaveEncashment: z.boolean().default(false)
});

export const UpdateLeaveTypeSchema = z.object({
  id: z.string(),
  type: z
    .string()
    .min(4, { message: "Min. 4 letters is required." })
    .max(128, { message: "Max. 128 characters is allowed." }),
})

export const DeleteLeaveTypeSchema = z.object({
  id: z.string()
})

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

// DEPARTMENT SCHEMAS
export const CreateSalaryComponentSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Min. allowed length is 4" })
    .max(128, { message: "Max. allowed length is 128" }),
});

// HOLIDAY SCHEMA
export const CreateHolidaySchema = z.object({
  id: z.string(),
  name: z.string({ required_error: "Holiday name is required" }).min(4, { message: "Min. length is 4" }).max(128, { message: "Max. length is 128" }),
  date: z.date(),
})

export const GetHolidayByMonthInput = z.object({
  start: z.date(),
  end: z.date()
})

export const UpdateHolidaySchema = CreateHolidaySchema

export const DeleteHolidaySchema = z.object({
  id: z.string(),
})
