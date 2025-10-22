import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, booths, InsertBooth, students, InsertStudent, attendance, InsertAttendance } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Booth queries
export async function getAllBooths() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(booths);
}

export async function getBoothById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(booths).where(eq(booths.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBoothsByAdmin(adminId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(booths).where(eq(booths.adminId, adminId));
}

export async function createBooth(booth: InsertBooth) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(booths).values(booth);
  return result;
}

export async function updateBooth(id: number, data: Partial<InsertBooth>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(booths).set(data).where(eq(booths.id, id));
}

export async function deleteBooth(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(booths).where(eq(booths.id, id));
}

// Student queries
export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(students);
}

export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentByStudentId(studentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.studentId, studentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentByQrCode(qrCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.qrCode, qrCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStudent(student: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(students).values(student);
  return result;
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(students).where(eq(students.id, id));
}

// Attendance queries
export async function recordAttendance(data: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(attendance).values(data);
  return result;
}

export async function getAttendanceByBooth(boothId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: attendance.id,
    scannedAt: attendance.scannedAt,
    student: students,
  })
  .from(attendance)
  .leftJoin(students, eq(attendance.studentId, students.id))
  .where(eq(attendance.boothId, boothId));
}

export async function getAttendanceByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: attendance.id,
    scannedAt: attendance.scannedAt,
    booth: booths,
  })
  .from(attendance)
  .leftJoin(booths, eq(attendance.boothId, booths.id))
  .where(eq(attendance.studentId, studentId));
}

export async function checkAttendance(studentId: number, boothId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select()
    .from(attendance)
    .where(and(eq(attendance.studentId, studentId), eq(attendance.boothId, boothId)))
    .limit(1);
  return result.length > 0;
}
