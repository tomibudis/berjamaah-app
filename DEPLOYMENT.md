# Berjamaah App Deployment Guide

This guide covers deploying the Berjamaah application, a monorepo containing a Next.js frontend and backend with PostgreSQL database, Prisma ORM, Better-Auth, and tRPC.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
  - [Vercel Deployment](#vercel-deployment)
  - [Docker Deployment](#docker-deployment)
  - [Manual Server Deployment](#manual-server-deployment)
- [Post-Deployment Steps](#post-deployment-steps)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

The Berjamaah application consists of:

- **Frontend (Web App)**: Next.js application running on port 3001
- **Backend (Server)**: Next.js API with tRPC running on port 3000
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better-Auth with Google OAuth support
- **Build System**: Turborepo for monorepo management

## Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** (v11.4.2 or higher)
3. **PostgreSQL** database (local or cloud-hosted)
4. **Google Cloud Console** account (for OAuth)
5. **Domain name** (for production deployment)

## Environment Variables

### Server Environment Variables (`apps/server/.env`)

```env
# Supabase Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Project Details (Optional - for additional features)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
BETTER_AUTH_SECRET="your-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="https://your-server-domain.com"

# CORS Configuration
CORS_ORIGIN="https://your-frontend-domain.com"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server Configuration
NEXT_PUBLIC_SERVER_URL="https://your-server-domain.com"
```

### Web Environment Variables (`apps/web/.env`)

```env
# API Configuration
NEXT_PUBLIC_SERVER_URL="https://your-server-domain.com"
NEXT_PUBLIC_CLIENT_URL="https://your-frontend-domain.com"
```

## Database Setup with Supabase

This guide uses Supabase as the database provider, which provides a managed PostgreSQL database with additional features like real-time subscriptions, authentication, and storage.

### 1. Create Supabase Project

1. **Sign up for Supabase**:
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub, Google, or email

2. **Create New Project**:
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `berjamaah-app`
     - **Database Password**: Generate a strong password (save this!)
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Start with Free tier

3. **Wait for Setup**:
   - Project creation takes 1-2 minutes
   - You'll see a progress indicator

### 2. Get Database Connection Details

1. **Navigate to Settings**:
   - Go to your project dashboard
   - Click "Settings" in the left sidebar
   - Click "Database"

2. **Copy Connection String**:
   - Scroll down to "Connection string"
   - Select "URI" tab
   - Copy the connection string (it looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

3. **Get Direct URL**:
   - The direct URL is the same as the connection string
   - This is used for Prisma migrations

### 3. Configure Environment Variables

Update your server environment variables with Supabase details:

```env
# Supabase Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Project Details (Optional - for additional features)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**To get the Supabase keys**:
1. Go to Settings > API
2. Copy the "Project URL" and "anon public" key
3. Copy the "service_role" key (keep this secret!)

### 4. Configure Prisma for Supabase

The existing Prisma configuration is already compatible with Supabase. However, you may want to add connection pooling for better performance:

```env
# For connection pooling (recommended for production)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 5. Run Database Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to Supabase database
npm run db:push

# Optional: Seed the database
npm run db:seed
```

### 6. Verify Database Connection

1. **Check in Supabase Dashboard**:
   - Go to "Table Editor" in your Supabase dashboard
   - You should see your tables created by Prisma

2. **Test Connection**:
   ```bash
   # Open Prisma Studio to verify
   npm run db:studio
   ```

### 7. Supabase Security Configuration

1. **Row Level Security (RLS)**:
   - Supabase enables RLS by default
   - For your application, you may want to disable RLS for certain tables
   - Go to "Authentication" > "Policies" in Supabase dashboard

2. **Database Access**:
   - Go to Settings > Database
   - Configure allowed IP addresses if needed
   - Enable SSL connections (recommended)

### 8. Supabase Additional Features (Optional)

Supabase provides additional features you can leverage:

1. **Real-time Subscriptions**:
   - Enable real-time updates for donations, programs, etc.
   - Useful for live donation tracking

2. **Storage**:
   - Store images, documents, and other files
   - Useful for program banners, user avatars

3. **Edge Functions**:
   - Serverless functions for custom logic
   - Can be used for payment processing, notifications

4. **Auth (Alternative to Better-Auth)**:
   - Supabase has built-in authentication
   - Can be used instead of Better-Auth if preferred

## Deployment Options

### Vercel Deployment (Recommended)

Vercel provides excellent support for Next.js applications and is the easiest deployment option.

#### 1. Deploy Server (Backend)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/server`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next`

3. **Environment Variables**:
   Add all server environment variables in Vercel dashboard:
   ```
   # Supabase Database
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   
   # Supabase Project (Optional)
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Authentication
   BETTER_AUTH_SECRET=...
   BETTER_AUTH_URL=https://your-server.vercel.app
   CORS_ORIGIN=https://your-frontend.vercel.app
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   NEXT_PUBLIC_SERVER_URL=https://your-server.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Note the deployment URL (e.g., `https://your-server.vercel.app`)

#### 2. Deploy Web (Frontend)

1. **Create New Project**:
   - Create another project in Vercel
   - Import the same repository

2. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next`

3. **Environment Variables**:
   ```
   NEXT_PUBLIC_SERVER_URL=https://your-server.vercel.app
   NEXT_PUBLIC_CLIENT_URL=https://your-frontend.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Note the deployment URL (e.g., `https://your-frontend.vercel.app`)

#### 3. Update Environment Variables

After both deployments, update the environment variables:

1. **Server Project**:
   - Update `CORS_ORIGIN` to your frontend URL
   - Update `BETTER_AUTH_URL` to your server URL

2. **Web Project**:
   - Update `NEXT_PUBLIC_SERVER_URL` to your server URL
   - Update `NEXT_PUBLIC_CLIENT_URL` to your frontend URL

3. **Redeploy** both projects to apply changes

### Docker Deployment

Create Docker configurations for containerized deployment.

#### 1. Create Dockerfile for Server

Create `apps/server/Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Create Dockerfile for Web

Create `apps/web/Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 3. Create Docker Compose

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  server:
    build:
      context: ./apps/server
      dockerfile: Dockerfile
    environment:
      # Supabase Database Configuration
      DATABASE_URL: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
      DIRECT_URL: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
      
      # Supabase Project Details (Optional)
      NEXT_PUBLIC_SUPABASE_URL: https://[PROJECT-REF].supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: your-anon-key
      SUPABASE_SERVICE_ROLE_KEY: your-service-role-key
      
      # Authentication
      BETTER_AUTH_SECRET: your-secret-key-here
      BETTER_AUTH_URL: http://localhost:3000
      CORS_ORIGIN: http://localhost:3001
      NEXT_PUBLIC_SERVER_URL: http://localhost:3000
    ports:
      - "3000:3000"

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_SERVER_URL: http://localhost:3000
      NEXT_PUBLIC_CLIENT_URL: http://localhost:3001
    ports:
      - "3001:3001"
    depends_on:
      - server
```

**Note**: This Docker setup uses Supabase as the external database, so no local PostgreSQL container is needed.

#### 4. Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# Run database migrations (connects to Supabase)
docker-compose exec server npx prisma db push

# Optional: Seed the database
docker-compose exec server npm run db:seed
```

**Note**: Make sure to update the environment variables in `docker-compose.yml` with your actual Supabase credentials before running the deployment.

### Manual Server Deployment

For deployment on your own server (VPS, dedicated server, etc.).

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Supabase Database Setup

Since we're using Supabase, you don't need to set up a local PostgreSQL database. Instead:

1. **Create Supabase Project** (if not done already):
   - Follow the Supabase setup steps in the "Database Setup with Supabase" section above
   - Get your database connection string and API keys

2. **Configure Environment Variables**:
   - Update your `.env` files with Supabase credentials
   - No local database installation required

#### 3. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-username/berjamaah-app.git
cd berjamaah-app

# Install dependencies
npm install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# Edit environment files with your production values
nano apps/server/.env
nano apps/web/.env

# Build applications
npm run build

# Set up database
npm run db:generate
npm run db:push
npm run db:seed
```

#### 4. Process Management with PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'berjamaah-server',
      cwd: './apps/server',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'berjamaah-web',
      cwd: './apps/web',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

Start applications:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

#### 5. Reverse Proxy with Nginx

Install and configure Nginx:

```bash
# Install Nginx
sudo apt install nginx -y

# Create configuration
sudo nano /etc/nginx/sites-available/berjamaah
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/berjamaah /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 6. SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Post-Deployment Steps

### 1. Verify Deployment

1. **Check Server Health**:
   - Visit `https://your-server-domain.com/api/health`
   - Verify database connection

2. **Check Frontend**:
   - Visit `https://your-frontend-domain.com`
   - Test authentication flow
   - Verify API connectivity

### 2. Google OAuth Configuration

1. **Update Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add production redirect URIs:
     - `https://your-server-domain.com/api/auth/callback/google`

2. **Update Environment Variables**:
   - Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
   - Redeploy if necessary

### 3. Database Seeding

```bash
# Run database seed (if not done during deployment)
npm run db:seed
```

### 4. Create Admin User

If you need to create an admin user manually:

```bash
# Access your database
psql -h your-host -U your-user -d your-database

# Insert admin user (replace with your details)
INSERT INTO users (id, email, password, role, full_name, created_at, updated_at) 
VALUES ('admin-id', 'admin@example.com', 'hashed-password', 'admin', 'Admin User', NOW(), NOW());
```

## Monitoring and Maintenance

### 1. Health Checks

Set up monitoring for:
- Database connectivity
- API response times
- Authentication service
- Frontend availability

### 2. Log Management

- **Vercel**: Built-in logging and monitoring
- **Docker**: Use `docker logs` or log aggregation tools
- **Manual**: Configure log rotation and monitoring

### 3. Supabase Database Maintenance

```bash
# Database optimization
npm run db:generate  # Regenerate Prisma client after updates

# Check database status
# Visit your Supabase dashboard to monitor:
# - Database usage and performance
# - Connection limits
# - Storage usage
# - API request limits
```

**Supabase Dashboard Monitoring**:
- Go to your Supabase project dashboard
- Monitor "Database" section for:
  - Active connections
  - Query performance
  - Storage usage
  - Backup status (automatic backups included)
- Check "API" section for:
  - Request limits
  - Response times
  - Error rates

### 4. Updates and Deployments

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run database migrations
npm run db:push

# Rebuild and restart
npm run build
pm2 restart all  # For manual deployment
```

## Troubleshooting

### Common Issues

#### 1. Supabase Database Connection Errors

**Symptoms**: Application fails to start, database connection timeouts

**Solutions**:
- Verify `DATABASE_URL` format matches Supabase connection string
- Check if your Supabase project is active (not paused)
- Ensure you're using the correct project reference and password
- Verify your IP is not blocked in Supabase settings
- Check Supabase service status at [status.supabase.com](https://status.supabase.com)
- Try using the connection pooler URL for better performance:
  ```
  DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
  ```

#### 2. CORS Errors

**Symptoms**: Frontend cannot communicate with backend

**Solutions**:
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check `BETTER_AUTH_URL` configuration
- Ensure both applications are using HTTPS in production

#### 3. Authentication Issues

**Symptoms**: Login/logout not working, session errors

**Solutions**:
- Verify `BETTER_AUTH_SECRET` is set and consistent
- Check Google OAuth configuration
- Ensure redirect URIs are correct
- Verify cookie settings for production

#### 4. Build Failures

**Symptoms**: Deployment fails during build process

**Solutions**:
- Check Node.js version compatibility
- Verify all environment variables are set
- Check for TypeScript errors: `npm run check-types`
- Ensure Prisma client is generated: `npm run db:generate`

#### 5. Supabase Row Level Security (RLS) Issues

**Symptoms**: Database queries fail, permission denied errors

**Solutions**:
- Check if RLS is enabled on your tables in Supabase dashboard
- Disable RLS for tables that don't need it (if using Better-Auth)
- Go to Supabase Dashboard > Authentication > Policies
- For development, you can disable RLS temporarily:
  ```sql
  ALTER TABLE your_table_name DISABLE ROW LEVEL SECURITY;
  ```

#### 6. Performance Issues

**Symptoms**: Slow response times, high memory usage

**Solutions**:
- Monitor database query performance in Supabase dashboard
- Check for N+1 queries in Prisma
- Optimize images and static assets
- Use Supabase connection pooler for better performance
- Check Supabase usage limits and upgrade plan if needed

### Debug Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs berjamaah-server
pm2 logs berjamaah-web

# Check database connection
npm run db:studio

# Verify environment variables
echo $DATABASE_URL

# Test API endpoints
curl https://your-server-domain.com/api/health
```

### Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs
2. Verify all environment variables
3. Test database connectivity
4. Review the [Better-T-Stack documentation](https://github.com/AmanVarshney01/create-better-t-stack)
5. Check [Prisma documentation](https://www.prisma.io/docs)
6. Review [Better-Auth documentation](https://www.better-auth.com/docs)

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use strong, unique secrets for `BETTER_AUTH_SECRET`
- Rotate secrets regularly
- Use environment-specific configurations

### 2. Supabase Database Security

- Use strong database passwords
- Enable SSL connections (enabled by default in Supabase)
- Configure Row Level Security (RLS) policies appropriately
- Use connection pooling for better security and performance
- Regularly review and rotate API keys
- Monitor database access logs in Supabase dashboard
- Set up database backups (automatic in Supabase)
- Use environment variables for all sensitive data

### 3. Application Security

- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Regular security audits

### 4. Google OAuth Security

- Keep client secrets secure
- Use proper redirect URIs
- Monitor OAuth usage
- Regular credential rotation

---

This deployment guide should help you successfully deploy the Berjamaah application. For additional support or questions, please refer to the project documentation or create an issue in the repository.
