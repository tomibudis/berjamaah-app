import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import prisma from '../../prisma/index';
import type { Prisma } from '@prisma/client';
import { Resend } from 'resend';
import ActivationEmail from '../emails/ActivationEmail';

import { hash } from 'bcryptjs';

export const userRouter = router({
  scheduleBulkUsers: protectedProcedure
    .input(
      z.object({
        emails: z.array(z.string().email()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const normalizedUniqueEmails = Array.from(
        new Set(input.emails.map(e => e.trim().toLowerCase()))
      );

      // Check for existing users first
      const existingUsers = await prisma.user.findMany({
        where: {
          email: {
            in: normalizedUniqueEmails,
          },
        },
        select: { email: true },
      });

      // Create a map of existing emails for quick lookup
      const existingEmailsSet = new Set(existingUsers.map(user => user.email));

      // Check which emails already exist and create field-specific errors
      const fieldErrors: Array<{
        index: number;
        email: string;
        message: string;
      }> = [];

      input.emails.forEach((email, index) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (existingEmailsSet.has(normalizedEmail)) {
          fieldErrors.push({
            index,
            email: email.trim(),
            message: 'Email ini sudah terdaftar dalam sistem',
          });
        }
      });

      // If there are field errors, return them instead of throwing
      if (fieldErrors.length > 0) {
        return {
          success: false,
          fieldErrors,
          message: 'Beberapa email sudah terdaftar dalam sistem',
        };
      }

      // Create new users only if none exist
      const results = await prisma.$transaction(
        normalizedUniqueEmails.map(email =>
          prisma.user.create({
            data: {
              email,
              status: 'scheduled' as const,
              password: null,
              role: 'user',
            },
            select: { id: true, email: true },
          })
        )
      );

      return {
        success: true,
        count: results.length,
        message: `Berhasil menjadwalkan ${results.length} pengguna`,
      };
    }),
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        bio: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          bio: input.bio,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          image: true,
          role: true,
        },
      });

      return user;
    }),

  // Get user by ID (for admin purposes)
  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const user = await prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }),

  // Get all users with pagination and filtering (admin only)
  getAllUsers: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z
          .enum(['all', 'scheduled', 'pending', 'active'])
          .default('all'),
        role: z.enum(['all', 'admin', 'user']).default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const { page, limit, search, status, role } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.UserWhereInput = {};

      // Search filter
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Status filter
      if (status !== 'all') {
        where.status = status as 'scheduled' | 'pending' | 'active';
      }

      // Role filter
      if (role !== 'all') {
        where.role = role as 'admin' | 'user';
      }

      // Get users with pagination
      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            fullName: true,
            firstName: true,
            lastName: true,
            phone: true,
            image: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                verifiedDonations: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);

      // Get user statistics
      const [activeCount, pendingCount, scheduledCount] = await Promise.all([
        prisma.user.count({ where: { status: 'active' } }),
        prisma.user.count({ where: { status: 'pending' } }),
        prisma.user.count({ where: { status: 'scheduled' } }),
      ]);

      const statusStats = {
        active: activeCount,
        pending: pendingCount,
        scheduled: scheduledCount,
      };

      return {
        users: users.map(user => ({
          ...user,
          totalDonations: user._count.verifiedDonations,
          totalAmount: 0, // This would need to be calculated from donations if needed
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          total: totalCount,
          active: statusStats.active || 0,
          pending: statusStats.pending || 0,
          scheduled: statusStats.scheduled || 0,
        },
      };
    }),

  // Complete registration via token (public)
  completeRegistration: publicProcedure
    .input(
      z
        .object({
          token: z.string().min(10),
          uniqueId: z.string().min(3),
          username: z.string().min(3),
          fullName: z.string().min(3),
          dob: z.string(),
          phone: z.string().min(6),
          password: z.string().min(8),
          confirmPassword: z.string().min(8),
        })
        .refine(v => v.password === v.confirmPassword, {
          message: 'Konfirmasi password tidak sama',
          path: ['confirmPassword'],
        })
    )
    .mutation(async ({ input }) => {
      // Find verification record by token
      const verification = await prisma.verification.findFirst({
        where: {
          value: input.token,
          expiresAt: { gt: new Date() },
        },
      });

      if (!verification) {
        throw new Error('Invalid or expired token');
      }

      const email = verification.identifier;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      // Check for existing uniqueId and username
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ uniqueId: input.uniqueId }, { username: input.username }],
        },
        select: { uniqueId: true, username: true },
      });

      if (existingUser) {
        const fieldErrors: string[] = [];

        if (existingUser.uniqueId === input.uniqueId) {
          fieldErrors.push('ID unik sudah digunakan');
        }

        if (existingUser.username === input.username) {
          fieldErrors.push('Username sudah digunakan');
        }

        throw new Error(fieldErrors.join(', '));
      }

      const hashedPassword = await hash(input.password, 12);

      const updated = await prisma.user.update({
        where: { email },
        data: {
          uniqueId: input.uniqueId,
          username: input.username,
          fullName: input.fullName,
          phone: input.phone,
          dob: new Date(input.dob),
          password: hashedPassword,
          status: 'active' as const,
          updatedAt: new Date(),
        },
        select: { id: true, email: true },
      });

      // Remove token after successful completion
      await prisma.verification.delete({
        where: { id: verification.id },
      });

      return { userId: updated.id };
    }),

  // Update user role to admin (admin only)
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['admin', 'user']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      // Check if user is trying to change their own role
      if (ctx.session.user.id === input.userId) {
        throw new Error('Cannot change your own role');
      }

      const updatedUser = await prisma.user.update({
        where: { id: input.userId },
        data: {
          role: input.role,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
        },
      });

      return updatedUser;
    }),

  // Resend activation email (admin only)
  resendActivationEmail: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          email: true,
          status: true,
          name: true,
          fullName: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.email) {
        throw new Error('User email not found');
      }

      // Only allow resending for pending or scheduled users
      if (user.status === 'active') {
        throw new Error('User is already active');
      }

      // Generate new activation token
      const token = generateToken(48);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 hours

      // Create or update verification record
      await prisma.verification.upsert({
        where: {
          value: token,
        },
        update: {
          identifier: user.email,
          expiresAt,
        },
        create: {
          identifier: user.email,
          value: token,
          expiresAt,
        },
      });

      // Generate activation URL
      const baseUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_URL || '';
      const activationUrl = `${baseUrl}/complete-registration?token=${encodeURIComponent(token)}`;

      // Send activation email
      await sendActivationEmail(user.email, activationUrl);

      // Update user status to pending if it was scheduled
      if (user.status === 'scheduled') {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: 'pending',
            updatedAt: new Date(),
          },
        });
      }

      return {
        success: true,
        message: 'Activation email sent successfully',
      };
    }),
});

// Helper function to generate token
function generateToken(length = 48) {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return token;
}

// Helper function to send activation email
async function sendActivationEmail(email: string, activationUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'noreply@berjamaah.id';

  if (!apiKey) {
    throw new Error('Email service not configured');
  }

  const resend = new Resend(apiKey);
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Berjamaah';
  const logoUrl =
    process.env.NEXT_PUBLIC_LOGO_URL ||
    `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/favicon.ico`;

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'Aktivasi Akun Berjamaah',
    react: ActivationEmail({
      appName,
      logoUrl,
      activationUrl,
      userName: email.split('@')[0], // Use email prefix as username
    }),
  });

  if (error) {
    console.error('Resend error', error);
    throw new Error('Failed to send activation email');
  }
}
