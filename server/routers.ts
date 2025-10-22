import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  booths: router({
    list: publicProcedure.query(async () => {
      const { getAllBooths } = await import("./db");
      return getAllBooths();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getBoothById } = await import("./db");
      return getBoothById(input.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        adminId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can create booths' });
        }
        const { createBooth } = await import("./db");
        return createBooth(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        adminId: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can update booths' });
        }
        const { id, ...data } = input;
        const { updateBooth } = await import("./db");
        await updateBooth(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can delete booths' });
        }
        const { deleteBooth } = await import("./db");
        await deleteBooth(input.id);
        return { success: true };
      }),
    myBooths: protectedProcedure.query(async ({ ctx }) => {
      const { getBoothsByAdmin } = await import("./db");
      return getBoothsByAdmin(ctx.user.id);
    }),
  }),

  students: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can view all students' });
      }
      const { getAllStudents } = await import("./db");
      return getAllStudents();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getStudentById } = await import("./db");
      return getStudentById(input.id);
    }),
    getByQrCode: publicProcedure.input(z.object({ qrCode: z.string() })).query(async ({ input }) => {
      const { getStudentByQrCode } = await import("./db");
      return getStudentByQrCode(input.qrCode);
    }),
    create: protectedProcedure
      .input(z.object({
        studentId: z.string(),
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        major: z.string().optional(),
        year: z.number().optional(),
        qrCode: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can create students' });
        }
        const { createStudent } = await import("./db");
        return createStudent(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        studentId: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        major: z.string().optional(),
        year: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can update students' });
        }
        const { id, ...data } = input;
        const { updateStudent } = await import("./db");
        await updateStudent(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can delete students' });
        }
        const { deleteStudent } = await import("./db");
        await deleteStudent(input.id);
        return { success: true };
      }),
  }),

  attendance: router({
    scan: protectedProcedure
      .input(z.object({
        qrCode: z.string(),
        boothId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getStudentByQrCode, checkAttendance, recordAttendance } = await import("./db");
        
        const student = await getStudentByQrCode(input.qrCode);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
        }

        const alreadyAttended = await checkAttendance(student.id, input.boothId);
        if (alreadyAttended) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Student already attended this booth' });
        }

        await recordAttendance({
          studentId: student.id,
          boothId: input.boothId,
          scannedBy: ctx.user.id,
        });

        return { success: true, student };
      }),
    getByBooth: protectedProcedure
      .input(z.object({ boothId: z.number() }))
      .query(async ({ input }) => {
        const { getAttendanceByBooth } = await import("./db");
        return getAttendanceByBooth(input.boothId);
      }),
    getByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        const { getAttendanceByStudent } = await import("./db");
        return getAttendanceByStudent(input.studentId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
