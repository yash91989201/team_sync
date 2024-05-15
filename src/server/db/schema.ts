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
  employeeProfile: one(empProfileTable),
  employeeShift: one(empShiftTable),
  employeeAttendance: many(empAttendanceTable),
  employeeLeaveRequest: many(leaveRequestTable, {
    relationName: "empLeaveRequest",
  }),
  leaveRequestReviewer: many(leaveRequestTable, {
    relationName: "leaveRequestReviewer",
  }),
  leaveBalance: many(leaveBalanceTable),
  employeeDocument: many(empDocumentTable),
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

export const empProfileTable = mysqlTable("emp_profile", {
  // FOREIGN KEY AS PRIMAY KEY - SINCE USER - EMPLOYEE PROFILE IS ONE-ONE RELATIONSHIP
  empId: varchar("emp_id", { length: 24 })
    .primaryKey()
    .references(() => userTable.id),
  joiningDate: date("joining_date", { mode: "date" }).notNull(),
  empBand: mysqlEnum("emp_band", ["U1", "U2", "U3"]).notNull(),
  salary: int("salary").notNull(),
  location: varchar("location", { length: 256 }).notNull(),
  dob: date("dob", { mode: "date" }).notNull(),
  isProfileUpdated: boolean("is_profile_updated").default(false).notNull(),
  // FOREIGN KEY
  deptId: varchar("dept_id", { length: 24 }).notNull().references(() => departmentTable.id),
  designationId: varchar("designation_id", { length: 24 }).notNull().references(() => designationTable.id)
});

export const empProfileTableRelations = relations(
  empProfileTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [empProfileTable.empId],
      references: [userTable.id],
    }),
    department: one(departmentTable, {
      fields: [empProfileTable.deptId],
      references: [departmentTable.id]
    }),
    designation: one(designationTable, {
      fields: [empProfileTable.designationId],
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
    employees: many(empProfileTable),
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
    employees: many(empProfileTable),
  }),
);

export const empShiftTable = mysqlTable("emp_shift", {
  // FOREIGN KEY AS PRIMAY KEY - SINCE EMPLOYEE AND EMPLOYEE SHIFT IS ONE-ONE RELATIONSHIP
  empId: varchar("emp_id", { length: 24 })
    .primaryKey()
    .references(() => userTable.id),
  shiftStart: time("shift_start", { fsp: 0 }).notNull(),
  shiftEnd: time("shift_end", { fsp: 0 }).notNull(),
  breakMinutes: int("break_minutes").notNull(),
});

export const empShiftTableRelations = relations(
  empShiftTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [empShiftTable.empId],
      references: [userTable.id],
    }),
  }),
);

export const empAttendanceTable = mysqlTable("emp_attendance", {
  id: varchar("id", { length: 24 }).primaryKey(),
  date: date("date", { mode: "date" }).notNull(),
  punchIn: time("punch_in", { fsp: 0 }).notNull(),
  punchOut: time("punch_out", { fsp: 0 }),
  hours: time("hours", { fsp: 0 }),
  shift: mysqlEnum("shift", ["0", "0.5", "0.75", "1"]),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", { length: 24 })
    .notNull()
    .references(() => userTable.id),
});

export const empAttendanceTableRelations = relations(
  empAttendanceTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [empAttendanceTable.empId],
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
  leaveEncashment: boolean("leave_encashment").notNull()
});

export const leaveTypeTableRelations = relations(
  leaveTypeTable,
  ({ many }) => ({
    leaveRequest: many(leaveRequestTable),
    leaveBalance: many(leaveBalanceTable),
  }),
);

export const empLeaveTypeTable = mysqlTable("emp_leave_type", {
  empId: varchar("emp_id", {
    length: 24,
  }).notNull().references(() => userTable.id),
  leaveTypeId: varchar("leave_type_id", {
    length: 24,
  }).notNull().references(() => leaveTypeTable.id),
}, (table) => ({
  employeeLeaveId: primaryKey({ name: "empLeaveId", columns: [table.empId, table.leaveTypeId] })
}))

export const empLeaveTypeTableRelations = relations(empLeaveTypeTable, ({ one }) => ({
  leaveType: one(leaveTypeTable, {
    fields: [empLeaveTypeTable.leaveTypeId],
    references: [leaveTypeTable.id]
  })
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
  status: mysqlEnum("status", ["pending", "approved", "rejected", "withdrawn"]).notNull(),
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
      relationName: "empLeaveRequest",
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
  createdAt: date("created_at", { mode: "date" }).notNull(),
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
    employeeDocuments: many(empDocumentTable),
  }),
);

export const empDocumentTable = mysqlTable("emp_document", {
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

export const empDocumentTableRelations = relations(
  empDocumentTable,
  ({ one, many }) => ({
    employee: one(userTable, {
      fields: [empDocumentTable.empId],
      references: [userTable.id],
    }),
    documentType: one(documentTypeTable, {
      fields: [empDocumentTable.documentTypeId],
      references: [documentTypeTable.id],
    }),
    documentFiles: many(empDocumentFileTable),
  }),
);

export const empDocumentFileTable = mysqlTable("emp_document_file", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  fileUrl: text("file_url").notNull(),
  // FOREIGN KEY RELATIONS
  empDocumentId: varchar("emp_document_id", {
    length: 24,
  })
    .notNull()
    .references(() => empDocumentTable.id),
});

export const empDocumentFileTableRelations = relations(
  empDocumentFileTable,
  ({ one }) => ({
    employeeDocument: one(empDocumentTable, {
      fields: [empDocumentFileTable.empDocumentId],
      references: [empDocumentTable.id],
    }),
  }),
);

export const salaryComponentTable = mysqlTable("salary_component", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  name: varchar("name", { length: 256 }).unique().notNull(),
})

export const empSalaryCompTable = mysqlTable("emp_salary_comp", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  amount: int("amount").notNull(),
  // FOREIGN KEY RELATIONS
  salaryComponentId: varchar("sal_comp_id", {
    length: 24,
  })
    .notNull()
    .references(() => salaryComponentTable.id),
  empId: varchar("emp_id", {
    length: 24,
  })
    .notNull()
    .references(() => userTable.id),
})

export const emplSalaryCompTableRelations = relations(empSalaryCompTable, ({ one }) => ({
  salaryComponent: one(salaryComponentTable, {
    fields: [empSalaryCompTable.salaryComponentId],
    references: [salaryComponentTable.id]
  })
}))

export const empPayslipTable = mysqlTable("emp_payslip", {
  id: varchar("id", {
    length: 24,
  }).primaryKey(),
  date: date("date", { mode: "date" }).notNull(),
  createdAt: datetime("created_at", { mode: "date" }).notNull(),
  calendarDays: int("calendar_days").notNull(),
  presentDays: int("present_days").notNull(),
  holidays: int("holidays").notNull(),
  paidLeaveDays: int("paid_leave_days").notNull(),
  unPaidLeaveDays: int("un_paid_leave_days").notNull(),
  leaveEncashmentDays: int("leave_encashment_days").notNull(),
  lopDays: int("lop_days").notNull(),
  daysPayable: int("days_payable").notNull(),
  totalSalary: int("total_salary").notNull(),
  pdfUrl: varchar("pdf_url", { length: 1024 }).notNull(),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", {
    length: 24,
  })
    .notNull()
    .references(() => userTable.id),
})

export const empPayslipTableRelations = relations(empPayslipTable, ({ one, many }) => ({
  employee: one(userTable, {
    fields: [empPayslipTable.empId],
    references: [userTable.id]
  }),
  payslipComponents: many(empPayslipCompTable, {
    relationName: "payslipComponents"
  }),
  leaveEncashment: one(leaveEncashmentTable, {
    fields: [empPayslipTable.id],
    references: [leaveEncashmentTable.empPayslipId]
  })
}))

export const empPayslipCompTable = mysqlTable("emp_payslip_comp", {
  name: varchar("name", { length: 256 }).notNull(),
  amount: int("amount").notNull(),
  arrear: int("arrear").notNull(),
  adjustment: int("adjustment").notNull(),
  amountPaid: int("amount_paid").notNull(),
  // FOREIGN KEY RELATIONS
  empPayslipId: varchar("emp_payslip_id", {
    length: 24,
  })
    .notNull()
    .references(() => empPayslipTable.id),
})

export const empPayslipCompTableRelations = relations(empPayslipCompTable, ({ one }) => ({
  payslip: one(empPayslipTable, {
    fields: [empPayslipCompTable.empPayslipId],
    references: [empPayslipTable.id],
    relationName: "payslipComponents"
  })
}))

export const leaveEncashmentTable = mysqlTable("leave_encashment", {
  amount: int("amount").notNull(),
  arrear: int("arrear").notNull(),
  adjustment: int("adjustment").notNull(),
  amountPaid: int("amount_paid").notNull(),
  // FOREIGN KEY RELATIONS
  empPayslipId: varchar("emp_payslip_id", {
    length: 24,
  })
    .notNull()
    .references(() => empPayslipTable.id),
})

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
