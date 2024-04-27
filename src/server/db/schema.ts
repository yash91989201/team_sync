import { relations } from "drizzle-orm";
import {
  varchar,
  datetime,
  mysqlTable,
  mysqlTableCreator,
  mysqlEnum,
  timestamp,
  boolean,
  text,
  time,
  int,
  date,
  unique,
  primaryKey,
} from "drizzle-orm/mysql-core";

export const createTable = mysqlTableCreator((name) => name);

export const userTable = mysqlTable("user", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  code: varchar("code", { length: 128 }).unique().notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  role: mysqlEnum("role", ["ADMIN", "EMPLOYEE"]).default("EMPLOYEE").notNull(),
  isTeamLead: boolean("is_team_lead").default(false).notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  imageUrl: text("image_url"),
});

export const userTableRelations = relations(userTable, ({ one, many }) => ({
  adminProfile: one(adminProfileTable),
  employeeProfile: one(employeeProfileTable),
  employeeShift: one(employeeShiftTable),
  employeeAttendance: many(employeeAttendanceTable),
  employeeLeaveRequest: many(leaveRequestTable, {
    relationName: "employeeLeaveRequest",
  }),
  leaveRequestReviewer: many(leaveRequestTable, {
    relationName: "leaveRequestReviewer",
  }),
  leaveBalance: many(leaveBalanceTable),
  employeeDocument: many(employeeDocumentTable),
}));

export const adminProfileTable = mysqlTable("admin_profile", {
  // FOREIGN KEY AS PRIMAY KEY - SINCE USER - ADMIN PROFILE IS ONE-ONE RELATIONSHIP
  adminId: varchar("admin_id", { length: 24 })
    .primaryKey()
    .references(() => userTable.id),
});

export const adminProfileTableRelations = relations(
  adminProfileTable,
  ({ one }) => ({
    admin: one(userTable, {
      fields: [adminProfileTable.adminId],
      references: [userTable.id],
    }),
  }),
);

export const employeeProfileTable = mysqlTable("employee_profile", {
  // FOREIGN KEY AS PRIMAY KEY - SINCE USER - EMPLOYEE PROFILE IS ONE-ONE RELATIONSHIP
  empId: varchar("emp_id", { length: 24 })
    .primaryKey()
    .references(() => userTable.id),
  joiningDate: timestamp("joining_date", { mode: "date" }).notNull(),
  empBand: mysqlEnum("emp_band", ["U1", "U2", "U3"]).notNull(),
  salary: int("salary").notNull(),
  location: varchar("location", { length: 256 }).notNull(),
  dob: date("dob", { mode: "date" }).notNull(),
  isProfileUpdated: boolean("is_profile_updated").default(false).notNull(),
  // FOREIGN KEY
  deptId: varchar("dept_id", { length: 24 }).notNull().references(() => departmentTable.id),
  designationId: varchar("designation_id", { length: 24 }).notNull().references(() => designationTable.id)
});

export const employeeProfileTableRelations = relations(
  employeeProfileTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [employeeProfileTable.empId],
      references: [userTable.id],
    }),
    department: one(departmentTable, {
      fields: [employeeProfileTable.deptId],
      references: [departmentTable.id]
    }),
    designation: one(designationTable, {
      fields: [employeeProfileTable.designationId],
      references: [designationTable.id]
    })
  }),
);

export const departmentTable = mysqlTable("department", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  name: varchar("name", { length: 128 }).unique().notNull(),
});

export const departmentTableRelations = relations(
  departmentTable,
  ({ many }) => ({
    designation: many(designationTable),
    employees: many(employeeProfileTable),
  }),
);

export const designationTable = mysqlTable("designation", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  // FOREIGN KEY RELATIONS
  deptId: varchar("dept_id", {
    length: 24,
  })
    .notNull()
    .references(() => departmentTable.id),
}, (designationTable) => ({
  // UNIQUE DESIGNATIONS ACCORDING TO DEPARTMENT
  deisgnationByDept: unique().on(designationTable.name, designationTable.deptId)
}));

export const designationTableRelations = relations(
  designationTable,
  ({ one, many }) => ({
    department: one(departmentTable, {
      fields: [designationTable.deptId],
      references: [departmentTable.id],
    }),
    employees: many(employeeProfileTable),
  }),
);

export const employeeShiftTable = mysqlTable("employee_shift", {
  // FOREIGN KEY AS PRIMAY KEY - SINCE EMPLOYEE AND EMPLOYEE SHIFT IS ONE-ONE RELATIONSHIP
  empId: varchar("emp_id", { length: 24 })
    .primaryKey()
    .references(() => userTable.id),
  shiftStart: time("shift_start", { fsp: 0 }).notNull(),
  shiftEnd: time("shift_end", { fsp: 0 }).notNull(),
  breakMinutes: int("break_minutes").notNull(),
});

export const employeeShiftTableRelations = relations(
  employeeShiftTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [employeeShiftTable.empId],
      references: [userTable.id],
    }),
  }),
);

export const employeeAttendanceTable = mysqlTable("employee_attendance", {
  id: varchar("id", { length: 24 }).primaryKey(),
  date: date("date", { mode: "string" }).notNull(),
  punchIn: time("punchIn").notNull(),
  punchOut: time("punchOut"),
  shiftHours: mysqlEnum("shift_hours", ["0", "0.5", "0.75", "1"]),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", { length: 24 })
    .notNull()
    .references(() => userTable.id),
});

export const employeeAttendanceTableRelations = relations(
  employeeAttendanceTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [employeeAttendanceTable.empId],
      references: [userTable.id],
    }),
  }),
);

export const leaveTypeTable = mysqlTable("leave_type", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  type: varchar("type", { length: 128 }).notNull().unique(),
  daysAllowed: int("days_allowed").notNull(),
  renewPeriod: mysqlEnum("renew_period", ["month", "year"]).notNull(),
  renewPeriodCount: int("renew_period_count").notNull(),
  carryOver: boolean("carry_over").notNull(),
  paidLeave: boolean("paid_leave").notNull(),
});

export const leaveTypeTableRelations = relations(
  leaveTypeTable,
  ({ many }) => ({
    leaveRequest: many(leaveRequestTable),
    leaveBalance: many(leaveBalanceTable),
  }),
);

export const employeeLeaveTypeTable = mysqlTable("employee_leave_type", {
  empId: varchar("emp_id", {
    length: 24,
  }).notNull().references(() => userTable.id),
  leaveTypeId: varchar("leave_type_id", {
    length: 24,
  }).notNull().references(() => leaveTypeTable.id),
}, (employeeLeaveTypeTable) => ({
  employeeLeaveId: primaryKey({ name: "employeeLeaveId", columns: [employeeLeaveTypeTable.empId, employeeLeaveTypeTable.leaveTypeId] })
}))

export const leaveRequestTable = mysqlTable("leave_request", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  fromDate: date("from_date", { mode: "date" }).notNull(),
  toDate: date("to_date", { mode: "date" }).notNull(),
  leaveDays: int("leave_days").notNull(),
  reason: text("reason"),
  appliedOn: date("applied_on", { mode: "date" }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull(),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", { length: 24 })
    .notNull()
    .references(() => userTable.id),
  leaveTypeId: varchar("leave_type_id", { length: 24 })
    .notNull()
    .references(() => leaveTypeTable.id),
  reviewerId: varchar("reviewer_id", { length: 24 })
    .notNull()
    .references(() => userTable.id),
});

export const leaveRequestTableRelations = relations(
  leaveRequestTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [leaveRequestTable.empId],
      references: [userTable.id],
      relationName: "employeeLeaveRequest",
    }),
    leaveType: one(leaveTypeTable, {
      fields: [leaveRequestTable.leaveTypeId],
      references: [leaveTypeTable.id],
    }),
    reviewer: one(userTable, {
      fields: [leaveRequestTable.reviewerId],
      references: [userTable.id],
      relationName: "leaveRequestReviewer",
    }),
  }),
);

export const leaveBalanceTable = mysqlTable("leave_balance", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  createdAt: date("createdAt", { mode: "date" }).notNull(),
  balance: int("balance").notNull(),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", { length: 24 })
    .notNull()
    .references(() => userTable.id),
  leaveTypeId: varchar("leave_type_id", { length: 24 })
    .notNull()
    .references(() => leaveTypeTable.id),
});

export const leaveBalanceTableRelations = relations(
  leaveBalanceTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [leaveBalanceTable.empId],
      references: [userTable.id],
    }),
    leaveType: one(leaveTypeTable, {
      fields: [leaveBalanceTable.leaveTypeId],
      references: [leaveTypeTable.id],
    }),
  }),
);

export const documentTypeTable = mysqlTable("document_type", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  type: varchar("type", { length: 256 }).notNull(),
  fileType: mysqlEnum("file_type", [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]).notNull(),
  requiredFiles: int("required_files").notNull(),
});

export const documentTypeTableRelations = relations(
  documentTypeTable,
  ({ many }) => ({
    employeeDocuments: many(employeeDocumentTable),
  }),
);

export const employeeDocumentTable = mysqlTable("employee_document", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  verified: boolean("verified").notNull(),
  uniqueDocumentId: varchar("unique_document_id", { length: 128 }),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", {
    length: 24,
  })
    .notNull()
    .references(() => userTable.id),
  documentTypeId: varchar("document_type_id", {
    length: 24,
  })
    .notNull()
    .references(() => documentTypeTable.id),
});

export const employeDocumentTableRelations = relations(
  employeeDocumentTable,
  ({ one, many }) => ({
    employee: one(userTable, {
      fields: [employeeDocumentTable.empId],
      references: [userTable.id],
    }),
    documentType: one(documentTypeTable, {
      fields: [employeeDocumentTable.documentTypeId],
      references: [documentTypeTable.id],
    }),
    documentFiles: many(employeeDocumentFileTable),
  }),
);

export const employeeDocumentFileTable = mysqlTable("employee_document_file", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  fileUrl: text("file_url").notNull(),
  // FOREIGN KEY RELATIONS
  empDocumentId: varchar("emp_document_id", {
    length: 24,
  })
    .notNull()
    .references(() => employeeDocumentTable.id),
});

export const employeeDocumentFileTableRelations = relations(
  employeeDocumentFileTable,
  ({ one }) => ({
    employeeDocument: one(employeeDocumentTable, {
      fields: [employeeDocumentFileTable.empDocumentId],
      references: [employeeDocumentTable.id],
    }),
  }),
);

export const salaryComponentTable = mysqlTable("salary_component", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  name: varchar("name", { length: 256 }).unique().notNull(),
})

export const employeeSalaryComponentTable = mysqlTable("employee_salary_component", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  amount: int("amount").notNull(),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", {
    length: 24,
  })
    .notNull()
    .references(() => userTable.id),
}, (empSalaryComponentTable) => ({
  // UNIQUE DESIGNATIONS ACCORDING TO DEPARTMENT
  empSalaryComponent: unique().on(empSalaryComponentTable.name, empSalaryComponentTable.empId)
}))

export const holidayTable = mysqlTable("holiday", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  date: date("date", { mode: "date" }).notNull(),
})

export const sessionTable = mysqlTable("session", {
  id: varchar("id", {
    length: 48,
  }).primaryKey(),
  expiresAt: datetime("expires_at").notNull(),
  // FOREIGN KEY RELATIONS
  userId: varchar("user_id", {
    length: 24,
  })
    .notNull()
    .references(() => userTable.id),
});

export const verificationTokenTable = mysqlTable("verification_token", {
  token: varchar("token", { length: 256 }).primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const passwordResetTokenTable = mysqlTable("password_reset_token", {
  token: varchar("token", { length: 256 }).primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const twoFactorTokenTable = mysqlTable("two_factor_token", {
  token: varchar("token", { length: 256 }).primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const twoFactorConfirmationTable = mysqlTable(
  "two_factor_confirmation",
  {
    id: varchar("id", { length: 24 }).primaryKey(),
    userId: varchar("userId", { length: 24 })
      .notNull()
      .unique()
      .references(() => userTable.id),
  },
);
