# Admin Role Implementation

This document explains how to set up and test the admin functionality in the Berjamaah app.

## What's Been Implemented

1. **Better Auth Admin Plugin**: Added the admin plugin to both server and client configurations
2. **Database Schema Updates**: Added admin fields to User and Session models:
   - `role` (string, default: "user")
   - `banned` (boolean, default: false)
   - `banReason` (string, optional)
   - `banExpires` (datetime, optional)
   - `impersonatedBy` (string, optional) in Session model

3. **Admin Dashboard**: Created a comprehensive admin dashboard at `/admin` with:
   - User management (list, ban/unban, role changes)
   - Statistics overview
   - Real-time user data

4. **Role-based Redirects**: 
   - Admin users are automatically redirected to `/admin` when accessing `/dashboard`
   - Non-admin users are redirected to `/dashboard` when accessing `/admin`
   - Admin link appears in user menu for admin users

## Setup Instructions

### 1. Database Migration

Run the Prisma generate command to update the database schema:

```bash
cd apps/server
npx prisma generate
```

### 2. Seed the Database

You can create admin users in several ways:

#### Option A: Using the Prisma seeder (Recommended)
```bash
cd apps/server
npm run db:seed
```

**Note**: The seeder automatically loads environment variables from the `.env` file.

This will create:
- Admin user: `admin@berjamaah.com` / `admin123`
- Sample user: `user@berjamaah.com` / `user123`

#### Option B: Reset and seed the entire database
```bash
cd apps/server
npm run db:reset
```

#### Option C: Using Better Auth Admin API
Once you have at least one user, you can promote them to admin using the admin API:

```typescript
// In your application or via API call
await authClient.admin.setRole({
  userId: "user-id-here",
  role: "admin"
});
```

#### Option D: Direct database update
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Test the Implementation

1. **Start the applications**:
   ```bash
   # Terminal 1 - Server
   cd apps/server
   npm run dev

   # Terminal 2 - Web
   cd apps/web
   npm run dev
   ```

2. **Login as admin**:
   - Go to `http://localhost:3000/signin`
   - Use admin credentials: `admin@berjamaah.com` / `admin123`
   - You should be automatically redirected to `/admin`

3. **Test admin features**:
   - View user statistics
   - List all users
   - Ban/unban users
   - Change user roles
   - Access admin dashboard from user menu

## Admin Dashboard Features

### User Management
- **List Users**: View all registered users with pagination
- **Ban/Unban**: Temporarily or permanently ban users
- **Role Management**: Promote users to admin or demote admins
- **User Statistics**: See total users, active users, banned users, and admin count

### Security Features
- **Role-based Access**: Only admin users can access admin routes
- **Session Management**: Better Auth handles session validation
- **Automatic Redirects**: Users are redirected based on their role

## API Endpoints

The admin plugin provides these endpoints:

- `POST /admin/create-user` - Create new users
- `GET /admin/list-users` - List users with filtering
- `POST /admin/set-role` - Change user roles
- `POST /admin/ban-user` - Ban users
- `POST /admin/unban-user` - Unban users
- `POST /admin/impersonate-user` - Impersonate users (for support)
- `POST /admin/remove-user` - Delete users

## Configuration

The admin plugin is configured in `apps/server/src/lib/auth.ts`:

```typescript
admin({
  defaultRole: 'user',
  adminRoles: ['admin'],
})
```

## Troubleshooting

### Common Issues

1. **"User is not admin" error**: Make sure the user has `role: 'admin'` in the database
2. **Redirect loops**: Check that the middleware is not interfering with admin routes
3. **Session not found**: Ensure the user is properly logged in and session is valid

### Debug Steps

1. Check user role in database:
   ```sql
   SELECT id, name, email, role, banned FROM "user" WHERE email = 'your-email@example.com';
   ```

2. Check session data:
   ```typescript
   const session = await authClient.getSession();
   console.log(session?.user?.role);
   ```

3. Verify admin plugin is loaded:
   ```typescript
   // Should return admin methods
   console.log(authClient.admin);
   ```

## Security Considerations

- Admin users have full access to user management
- Consider implementing additional permission levels
- Monitor admin actions for audit trails
- Use HTTPS in production
- Consider implementing 2FA for admin accounts

## Next Steps

1. **Audit Logging**: Add logging for admin actions
2. **Permission System**: Implement granular permissions
3. **Admin Notifications**: Add notifications for admin actions
4. **Bulk Operations**: Add bulk user management features
5. **Advanced Filtering**: Add more filtering options for user lists
