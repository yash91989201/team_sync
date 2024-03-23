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

export const createTable = mysqlTableCreator((name) => `team_sync_${name}`);

export const userTable = mysqlTable("user", {
  id: varchar("id", {
    length: 256,
  }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  role: mysqlEnum("role", ["ADMIN", "EMPLOYEE"]).default("EMPLOYEE").notNull(),
  imageUrl: text("image_url"),
  isTeamLead: boolean("is_team_lead").default(false),
});

export const userTableRelations = relations(userTable, ({ one }) => ({
  userProfile: one(userProfileTable, {
    fields: [userTable.id],
    references: [userProfileTable.emp_id],
  }),
}));

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
  email: varchar("email", { length: 256 }).notNull().unique(),
  token: varchar("token", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const userProfileTable = mysqlTable("user_profile", {
  id: varchar("id", { length: 256 }).primaryKey(),
  emp_id: varchar("emp_id", { length: 256 })
    .notNull()
    .references(() => userTable.id),
  joining_date: timestamp("joining_date", { mode: "date" }).notNull(),
  dept: varchar("dept", { length: 128 }),
  designation: varchar("designation", { length: 128 }),
  location: varchar("location", { length: 256 }),
  salary: int("salary"),
});

export const userProfileTableRelations = relations(
  userProfileTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [userProfileTable.emp_id],
      references: [userTable.id],
    }),
  }),
);
