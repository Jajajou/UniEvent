import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /**
   * Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user.
   * This mirrors the Manus account and should be used for authentication lookups.
   */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Booths table - stores information about event booths
 */
export const booths = mysqlTable("booths", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  adminId: int("adminId").references(() => users.id),
  isActive: int("isActive", { unsigned: true }).default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booth = typeof booths.$inferSelect;
export type InsertBooth = typeof booths.$inferInsert;

/**
 * Students table - stores student information
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  studentId: varchar("studentId", { length: 50 }).notNull().unique(), // Student ID number
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  major: varchar("major", { length: 255 }),
  year: int("year"), // Year of study
  qrCode: text("qrCode").notNull(), // QR code data (can be student ID or unique identifier)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Attendance table - tracks which students visited which booths
 */
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  boothId: int("boothId").notNull().references(() => booths.id),
  scannedAt: timestamp("scannedAt").defaultNow().notNull(),
  scannedBy: int("scannedBy").notNull().references(() => users.id), // User who scanned the QR
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;