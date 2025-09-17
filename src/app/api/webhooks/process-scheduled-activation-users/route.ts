import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../prisma/index';
import { Resend } from 'resend';

function generateToken(length = 48) {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return token;
}

async function sendActivationEmail(email: string, activationUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'noreply@berjamaah.com';
  if (!apiKey) return;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'Aktivasi Akun Berjamaah',
    html: `<strong>Selamat datang!</strong><br/>Silakan aktifkan akun Anda dengan membuka tautan berikut: <a href="${activationUrl}">Aktifkan Akun</a>`,
  });
  if (error) {
    console.error('Resend error', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Optional: verify secret header from GitHub Actions
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      const header = req.headers.get('x-webhook-secret');
      if (header !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_URL || '';

    // Daily cap logic: max 50 per day
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sentToday = await prisma.user.count({
      where: {
        status: 'pending',
        updatedAt: { gte: startOfToday },
      },
    });

    const DAILY_LIMIT = 50;
    const remaining = Math.max(0, DAILY_LIMIT - sentToday);
    if (remaining === 0) {
      return NextResponse.json({ processed: 0, remaining: 0 });
    }

    const scheduledUsers = await prisma.user.findMany({
      where: {
        status: 'scheduled',
      },
      select: { id: true, email: true },
      orderBy: { createdAt: 'asc' as const },
      take: remaining,
    });

    for (const u of scheduledUsers) {
      if (!u.email) continue;
      const token = generateToken(48);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

      await prisma.verification.upsert({
        where: {
          // composite not guaranteed; use id-less upsert pattern via identifier+value unique if exists
          // fallback: create if not exists by unique on (identifier,value) not defined in schema
          // this assumes Prisma model has a unique on value; if not, this may throw and can be adjusted in migration
          value: token,
        },
        update: {},
        create: {
          identifier: u.email,
          value: token,
          expiresAt,
        },
      });

      const activationUrl = `${baseUrl}/complete-registration?token=${encodeURIComponent(token)}`;

      await sendActivationEmail(u.email, activationUrl);

      await prisma.user.update({
        where: { id: u.id },
        data: {
          status: 'pending' as const,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      processed: scheduledUsers.length,
      remaining: Math.max(0, DAILY_LIMIT - sentToday - scheduledUsers.length),
    });
  } catch (error) {
    console.error('Webhook processing error', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
