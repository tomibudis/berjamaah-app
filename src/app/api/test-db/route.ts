import { NextResponse } from 'next/server';
import prisma from '../../../../prisma';

export async function GET() {
  try {
    // Test basic database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    // Test user table access
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        testQuery: result,
        userCount,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
      },
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set',
      },
      { status: 500 }
    );
  }
}
