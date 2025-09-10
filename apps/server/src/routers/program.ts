import { TRPCError } from '@trpc/server';
import z from 'zod';
import prisma from '../../prisma/index';
import { protectedProcedure, publicProcedure, router } from '../lib/trpc';

// Validation schemas
const createProgramSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  bannerImage: z.string().url().optional(),
  category: z.string().optional(),
  status: z
    .enum(['draft', 'pending', 'active', 'paused', 'ended'])
    .default('draft'),
  programType: z
    .enum(['one_time', 'multiple', 'selected_date'])
    .default('one_time'),
  contact: z.string().optional(),
  details: z.string().optional(),
  initialPeriod: z
    .object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      cycleNumber: z.number().int().positive().optional(),
      recurringFrequency: z
        .enum(['weekly', 'monthly', 'quarterly', 'yearly'])
        .optional(),
      recurringDay: z.number().int().min(1).max(31).optional(),
      recurringDurationDays: z.number().int().positive().optional(),
      totalCycles: z.number().int().positive().optional(),
      nextActivationDate: z.coerce.date().optional(),
    })
    .optional(),
});

const updateProgramSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  bannerImage: z.string().url().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'pending', 'active', 'paused', 'ended']).optional(),
  programType: z.enum(['one_time', 'multiple', 'selected_date']).optional(),
  contact: z.string().optional(),
  details: z.string().optional(),
});

const createProgramPeriodSchema = z.object({
  programId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  cycleNumber: z.number().int().positive().optional(),
  recurringFrequency: z
    .enum(['weekly', 'monthly', 'quarterly', 'yearly'])
    .optional(),
  recurringDay: z.number().int().min(1).max(31).optional(),
  recurringDurationDays: z.number().int().positive().optional(),
  totalCycles: z.number().int().positive().optional(),
  nextActivationDate: z.date().optional(),
});

const updateProgramPeriodSchema = z.object({
  id: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  cycleNumber: z.number().int().positive().optional(),
  recurringFrequency: z
    .enum(['weekly', 'monthly', 'quarterly', 'yearly'])
    .optional(),
  recurringDay: z.number().int().min(1).max(31).optional(),
  recurringDurationDays: z.number().int().positive().optional(),
  totalCycles: z.number().int().positive().optional(),
  nextActivationDate: z.date().optional(),
});

export const programRouter = router({
  // Program CRUD operations
  getAll: publicProcedure
    .input(
      z.object({
        status: z
          .enum(['draft', 'pending', 'active', 'paused', 'ended'])
          .optional(),
        category: z.string().optional(),
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const where: any = {};

        if (input.status) {
          where.status = input.status;
        }

        if (input.category) {
          where.category = input.category;
        }

        const [programs, total] = await Promise.all([
          prisma.program.findMany({
            where,
            include: {
              programPeriods: {
                select: {
                  id: true,
                  startDate: true,
                  endDate: true,
                  currentAmount: true,
                  cycleNumber: true,
                },
                orderBy: {
                  startDate: 'desc',
                },
              },
              _count: {
                select: {
                  donations: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: input.limit,
            skip: input.offset,
          }),
          prisma.program.count({ where }),
        ]);

        return {
          programs,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch programs',
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const program = await prisma.program.findUnique({
          where: { id: input.id },
          include: {
            programPeriods: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                currentAmount: true,
                cycleNumber: true,
                recurringFrequency: true,
                recurringDay: true,
                recurringDurationDays: true,
                totalCycles: true,
                nextActivationDate: true,
              },
              orderBy: {
                startDate: 'desc',
              },
            },
            donations: {
              select: {
                id: true,
                amount: true,
                status: true,
                createdAt: true,
                donorName: true,
                donorEmail: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 10, // Limit recent donations
            },
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        return program;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch program details',
        });
      }
    }),

  create: protectedProcedure
    .input(createProgramSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { initialPeriod, ...programData } = input;

        // Validate initial period date range when provided
        if (initialPeriod && initialPeriod.endDate < initialPeriod.startDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'End date must be after or equal to start date',
          });
        }

        const program = await prisma.program.create({
          data: {
            ...programData,
            targetAmount: programData.targetAmount,
            createdBy: ctx.session.user.id,
            status: 'draft',
            ...(initialPeriod
              ? {
                  programPeriods: {
                    create: {
                      startDate: initialPeriod.startDate,
                      endDate: initialPeriod.endDate,
                      cycleNumber: initialPeriod.cycleNumber,
                      recurringFrequency: initialPeriod.recurringFrequency,
                      recurringDay: initialPeriod.recurringDay,
                      recurringDurationDays:
                        initialPeriod.recurringDurationDays,
                      totalCycles: initialPeriod.totalCycles,
                      nextActivationDate: initialPeriod.nextActivationDate,
                    },
                  },
                }
              : {}),
          },
          include: {
            programPeriods: true,
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return program;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create program',
        });
      }
    }),

  update: protectedProcedure
    .input(updateProgramSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the creator of the program
        const existingProgram = await prisma.program.findUnique({
          where: { id: input.id },
          select: { createdBy: true },
        });

        if (!existingProgram) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        if (existingProgram.createdBy !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update programs you created',
          });
        }

        const { id, ...updateData } = input;
        const program = await prisma.program.update({
          where: { id },
          data: updateData,
          include: {
            programPeriods: true,
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return program;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update program',
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the creator of the program
        const existingProgram = await prisma.program.findUnique({
          where: { id: input.id },
          select: { createdBy: true },
        });

        if (!existingProgram) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        if (existingProgram.createdBy !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete programs you created',
          });
        }

        await prisma.program.delete({
          where: { id: input.id },
        });

        return { success: true, message: 'Program deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete program',
        });
      }
    }),

  // Program Period CRUD operations
  getProgramPeriods: publicProcedure
    .input(z.object({ programId: z.string() }))
    .query(async ({ input }) => {
      try {
        const periods = await prisma.programPeriod.findMany({
          where: { programId: input.programId },
          include: {
            _count: {
              select: {
                donations: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        });

        return periods;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch program periods',
        });
      }
    }),

  createProgramPeriod: protectedProcedure
    .input(createProgramPeriodSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the creator of the program
        const program = await prisma.program.findUnique({
          where: { id: input.programId },
          select: { createdBy: true },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        if (program.createdBy !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only create periods for programs you created',
          });
        }

        // Validate date range
        if (input.endDate <= input.startDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'End date must be after start date',
          });
        }

        const period = await prisma.programPeriod.create({
          data: input,
          include: {
            program: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return period;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create program period',
        });
      }
    }),

  updateProgramPeriod: protectedProcedure
    .input(updateProgramPeriodSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the creator of the program
        const period = await prisma.programPeriod.findUnique({
          where: { id: input.id },
          include: {
            program: {
              select: { createdBy: true },
            },
          },
        });

        if (!period) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program period not found',
          });
        }

        if (period.program.createdBy !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update periods for programs you created',
          });
        }

        // Validate date range if both dates are provided
        if (
          input.startDate &&
          input.endDate &&
          input.endDate <= input.startDate
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'End date must be after start date',
          });
        }

        const { id, ...updateData } = input;
        const updatedPeriod = await prisma.programPeriod.update({
          where: { id },
          data: updateData,
          include: {
            program: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return updatedPeriod;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update program period',
        });
      }
    }),

  deleteProgramPeriod: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the creator of the program
        const period = await prisma.programPeriod.findUnique({
          where: { id: input.id },
          include: {
            program: {
              select: { createdBy: true },
            },
          },
        });

        if (!period) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program period not found',
          });
        }

        if (period.program.createdBy !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete periods for programs you created',
          });
        }

        await prisma.programPeriod.delete({
          where: { id: input.id },
        });

        return {
          success: true,
          message: 'Program period deleted successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete program period',
        });
      }
    }),

  // Program type-specific creation functions
  createOneTime: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        targetAmount: z.number().positive('Target amount must be positive'),
        bannerImage: z.string().url().optional(),
        category: z.string().optional(),
        contact: z.string().optional(),
        details: z.string().optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { startDate, endDate, ...programData } = input;

        // Validate date range
        if (endDate <= startDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'End date must be after start date',
          });
        }

        const program = await prisma.program.create({
          data: {
            ...programData,
            programType: 'one_time',
            status: 'draft',
            createdBy: ctx.session.user.id,
            programPeriods: {
              create: {
                startDate,
                endDate,
                cycleNumber: 1,
              },
            },
          },
          include: {
            programPeriods: true,
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return program;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create one-time program',
        });
      }
    }),

  createRecurring: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        targetAmount: z.number().positive('Target amount must be positive'),
        bannerImage: z.string().url().optional(),
        category: z.string().optional(),
        contact: z.string().optional(),
        details: z.string().optional(),
        recurringFrequency: z.enum([
          'weekly',
          'monthly',
          'quarterly',
          'yearly',
        ]),
        recurringDay: z.number().int().min(1).max(31),
        recurringDurationDays: z.number().int().positive(),
        totalCycles: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const {
          recurringFrequency,
          recurringDay,
          recurringDurationDays,
          totalCycles,
          ...programData
        } = input;

        const program = await prisma.program.create({
          data: {
            ...programData,
            programType: 'multiple',
            status: 'draft',
            createdBy: ctx.session.user.id,
            programPeriods: {
              create: {
                startDate: new Date(), // Will be set when first activated
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
                cycleNumber: 1,
                recurringFrequency,
                recurringDay,
                recurringDurationDays,
                totalCycles,
              },
            },
          },
          include: {
            programPeriods: true,
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return program;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create recurring program',
        });
      }
    }),

  createSelectedDates: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        targetAmount: z.number().positive('Target amount must be positive'),
        bannerImage: z.string().url().optional(),
        category: z.string().optional(),
        contact: z.string().optional(),
        details: z.string().optional(),
        selectedDateTimes: z
          .array(
            z.object({
              date: z.string(),
              startTime: z.string(),
              endTime: z.string(),
            })
          )
          .min(1, 'At least one date and time must be selected'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { selectedDateTimes, ...programData } = input;

        // Validate that all selected date times have valid time ranges
        for (const dateTime of selectedDateTimes) {
          if (dateTime.startTime === dateTime.endTime) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message:
                'Start and end time cannot be the same for any selected date',
            });
          }
        }

        // Create program with multiple program periods
        const program = await prisma.program.create({
          data: {
            ...programData,
            programType: 'selected_date',
            status: 'draft',
            createdBy: ctx.session.user.id,
            programPeriods: {
              create: selectedDateTimes.map((dateTime, index) => ({
                startDate: new Date(`${dateTime.date}T${dateTime.startTime}`),
                endDate: new Date(`${dateTime.date}T${dateTime.endTime}`),
                cycleNumber: index + 1,
              })),
            },
          },
          include: {
            programPeriods: true,
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return program;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create selected dates program',
        });
      }
    }),

  // Program approval/rejection for admins
  approveProgram: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is admin
        if (ctx.session.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can approve programs',
          });
        }

        const program = await prisma.program.findUnique({
          where: { id: input.id },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        if (program.status !== 'draft') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Only draft programs can be approved',
          });
        }

        const updatedProgram = await prisma.program.update({
          where: { id: input.id },
          data: {
            status: 'pending',
            approvedBy: ctx.session.user.id,
            approvedAt: new Date(),
            rejectedBy: null,
            rejectedAt: null,
            rejectionReason: null,
          },
          include: {
            programPeriods: true,
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return updatedProgram;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve program',
        });
      }
    }),

  rejectProgram: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is admin
        if (ctx.session.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can reject programs',
          });
        }

        const program = await prisma.program.findUnique({
          where: { id: input.id },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        if (program.status !== 'draft') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Only draft programs can be rejected',
          });
        }

        const updatedProgram = await prisma.program.update({
          where: { id: input.id },
          data: {
            status: 'rejected',
            rejectedBy: ctx.session.user.id,
            rejectedAt: new Date(),
            rejectionReason: input.reason || null,
            approvedBy: null,
            approvedAt: null,
          },
          include: {
            programPeriods: true,
            _count: {
              select: {
                donations: true,
              },
            },
          },
        });

        return updatedProgram;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject program',
        });
      }
    }),

  // Get programs pending approval
  getDraftPrograms: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Check if user is admin
        if (ctx.session.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can view draft programs',
          });
        }

        const [programs, total] = await Promise.all([
          prisma.program.findMany({
            where: {
              status: 'draft',
            },
            include: {
              programPeriods: {
                select: {
                  id: true,
                  startDate: true,
                  endDate: true,
                  currentAmount: true,
                  cycleNumber: true,
                },
                orderBy: {
                  startDate: 'desc',
                },
              },
              _count: {
                select: {
                  donations: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: input.limit,
            skip: input.offset,
          }),
          prisma.program.count({
            where: { status: 'draft' },
          }),
        ]);

        return {
          programs,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch draft programs',
        });
      }
    }),

  // Additional utility queries
  getProgramStats: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const program = await prisma.program.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            title: true,
            targetAmount: true,
            status: true,
            programPeriods: {
              select: {
                currentAmount: true,
                startDate: true,
                endDate: true,
              },
            },
            donations: {
              select: {
                amount: true,
                status: true,
              },
            },
          },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        const totalDonations = program.donations
          .filter((d: any) => d.status === 'completed')
          .reduce((sum: number, d: any) => sum + Number(d.amount), 0);

        const totalPeriodAmount = program.programPeriods.reduce(
          (sum: number, p: any) => sum + Number(p.currentAmount),
          0
        );

        // Since we removed status from programPeriods, we'll use date-based logic
        const now = new Date();
        const activePeriods = program.programPeriods.filter(
          (p: any) => p.startDate <= now && p.endDate >= now
        ).length;
        const completedPeriods = program.programPeriods.filter(
          (p: any) => p.endDate < now
        ).length;

        return {
          programId: program.id,
          programTitle: program.title,
          targetAmount: Number(program.targetAmount),
          totalDonations,
          totalPeriodAmount,
          progressPercentage:
            Number(program.targetAmount) > 0
              ? (totalDonations / Number(program.targetAmount)) * 100
              : 0,
          activePeriods,
          completedPeriods,
          totalPeriods: program.programPeriods.length,
          status: program.status,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch program statistics',
        });
      }
    }),
});
