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
  int,
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

export const userTableRelations = relations(userTable, ({ one }) => ({
  adminProfile: one(adminProfileTable, {
    fields: [userTable.id],
    references: [adminProfileTable.admin_id],
  }),
  employeeProfile: one(employeeProfileTable, {
    fields: [userTable.id],
    references: [employeeProfileTable.empId],
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
