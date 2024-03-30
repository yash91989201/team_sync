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
} from "drizzle-orm/mysql-core";

export const createTable = mysqlTableCreator((name) => name);

export const userTable = mysqlTable("user", {
  id: varchar("id", {
    length: 256,
  }).primaryKey(),
  code: varchar("code", { length: 128 }).unique().notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  role: mysqlEnum("role", ["ADMIN", "EMPLOYEE"]).default("EMPLOYEE").notNull(),
  isTeamLead: boolean("is_team_lead").default(false).notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
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
}));

export const adminProfileTable = mysqlTable("admin_profile", {
  // FOREIGN KEY AS PRIMAY KEY - SINCE USER - ADMIN PROFILE IS ONE-ONE RELATIONSHIP
  admin_id: varchar("admin_id", { length: 256 })
    .primaryKey()
    .references(() => userTable.id),
});

export const adminProfileTableRelations = relations(
  adminProfileTable,
  ({ one }) => ({
    admin: one(userTable, {
      fields: [adminProfileTable.admin_id],
      references: [userTable.id],
    }),
  }),
);

export const employeeProfileTable = mysqlTable("employee_profile", {
  // FOREIGN KEY AS PRIMAY KEY - SINCE USER - EMPLOYEE PROFILE IS ONE-ONE RELATIONSHIP
  empId: varchar("emp_id", { length: 256 })
    .primaryKey()
    .references(() => userTable.id),
  joiningDate: timestamp("joining_date", { mode: "date" }).notNull(),
  empBand: mysqlEnum("emp_band", ["U1", "U2", "U3"]).notNull(),
  dept: varchar("dept", { length: 128 }).notNull(),
  designation: varchar("designation", { length: 128 }).notNull(),
  paidLeaves: int("paid_leaves").notNull(),
  salary: int("salary").notNull(),
  location: varchar("location", { length: 256 }).notNull(),
  imageUrl: text("image_url"),
  isProfileUpdated: boolean("is_profile_updated").default(false).notNull(),
});

export const employeeProfileTableRelations = relations(
  employeeProfileTable,
  ({ one }) => ({
    employee: one(userTable, {
      fields: [employeeProfileTable.empId],
      references: [userTable.id],
    }),
  }),
);

export const departmentTable = mysqlTable("department", {
  id: varchar("id", {
    length: 256,
  }).primaryKey(),
  name: varchar("name", { length: 128 }).unique().notNull(),
});

export const designationTable = mysqlTable("designation", {
  id: varchar("id", {
    length: 256,
  }).primaryKey(),
  name: varchar("name", { length: 128 }).unique().notNull(),
});

export const employeeShiftTable = mysqlTable("employee_shift", {
  // FOREIGN KEY AS PRIMAY KEY - SINCE EMPLOYEE AND EMPLOYEE SHIFT IS ONE-ONE RELATIONSHIP
  empId: varchar("emp_id", { length: 256 })
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
  id: varchar("id", { length: 256 }).primaryKey(),
  date: date("date", { mode: "string" }).notNull(),
  punchIn: time("punchIn").notNull(),
  punchOut: time("punchOut"),
  shiftHours: mysqlEnum("shift_hours", ["0", "0.5", "0.75", "1"]),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", { length: 256 })
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
    length: 256,
  }).primaryKey(),
  type: varchar("type", { length: 128 }).notNull().unique(),
  daysAllowed: int("days_allowed").notNull(),
});

export const leaveRequestTable = mysqlTable("leave_request", {
  id: varchar("id", {
    length: 256,
  }).primaryKey(),
  fromDate: date("from_date", { mode: "date" }).notNull(),
  toDate: date("to_date", { mode: "date" }).notNull(),
  leaveDays: int("leave_days").notNull(),
  reason: text("reason"),
  leaveType: varchar("leave_type", { length: 128 }).notNull(),
  appliedOn: date("applied_on", { mode: "date" }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "denied"]).notNull(),
  // FOREIGN KEY RELATIONS
  empId: varchar("emp_id", { length: 256 })
    .notNull()
    .references(() => userTable.id),
  reviewerId: varchar("reviewer_id", { length: 256 })
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
    reviewer: one(userTable, {
      fields: [leaveRequestTable.reviewerId],
      references: [userTable.id],
      relationName: "leaveRequestReviewer",
    }),
  }),
);

export const sessionTable = mysqlTable("session", {
  id: varchar("id", {
    length: 256,
  }).primaryKey(),
  expiresAt: datetime("expires_at").notNull(),
  // FOREIGN KEY RELATIONS
  userId: varchar("user_id", {
    length: 256,
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
    id: varchar("id", { length: 256 }).primaryKey(),
    userId: varchar("userId", { length: 256 })
      .notNull()
      .unique()
      .references(() => userTable.id),
  },
);
