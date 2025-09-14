# Berjamaah App

A single-repository Next.js application for managing donations and programs.

## Features

- User authentication with Better Auth
- Admin and user role management
- Donation management and verification
- Program creation and management
- TRPC for type-safe API calls
- Prisma for database management
- Responsive UI with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:
- `DATABASE_URL`: PostgreSQL database connection string
- `BETTER_AUTH_SECRET`: Secret key for authentication
- `BETTER_AUTH_URL`: Your application URL
- `CORS_ORIGIN`: CORS origin URL
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `NEXT_PUBLIC_SERVER_URL`: Public server URL

3. Set up the database:
```bash
npm run db:push
npm run db:seed
```

4. Run the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Push database schema changes
- `npm run db:studio`: Open Prisma Studio
- `npm run db:generate`: Generate Prisma client
- `npm run db:migrate`: Run database migrations
- `npm run db:seed`: Seed the database
- `npm run db:reset`: Reset and seed database
- `npm run check-types`: Check TypeScript types

## Deployment

The application is configured for Vercel deployment. Make sure to set all required environment variables in your Vercel project settings.

## Architecture

- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API routes with TRPC
- **Authentication**: Better Auth
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query with TRPC