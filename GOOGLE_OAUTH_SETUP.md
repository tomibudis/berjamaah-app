# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the Berjamaah Todo application.

## Prerequisites

1. A Google Cloud Console account
2. A Google Cloud project

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set the application type to **Web application**
6. Configure the **Authorized redirect URIs**:
   - For local development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. After creation, note the **Client ID** and **Client Secret**

## Step 2: Environment Variables

Add the following environment variables to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Other required variables
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3001"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

## Step 3: Implementation Details

The Google OAuth integration has been implemented with the following changes:

### Server-side (apps/server/src/lib/auth.ts)

- Added `socialProviders` configuration with Google OAuth
- Configured client ID and secret from environment variables

### Client-side (apps/web/src/components/)

- Updated `sign-in-form.tsx` to include Google login button with loading state
- Updated `sign-up-form.tsx` to include Google login button with loading state
- Added proper styling and Google logo SVG
- Implemented smooth loading animation with spinner during OAuth process
- Added error handling for failed Google OAuth attempts
- Fixed redirect URL to point to frontend (localhost:3001) instead of backend

## Step 4: Testing

1. Start your development server
2. Navigate to the login page
3. Click the "Continue with Google" button
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your dashboard

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**

   - Ensure the redirect URI in Google Console matches your application URL
   - Check that the callback URL is exactly: `http://localhost:3000/api/auth/callback/google`
   - Note: The callback URL should point to your server (port 3000), not your frontend (port 3001)

2. **"Client ID not found" error**

   - Verify that `GOOGLE_CLIENT_ID` is set in your environment variables
   - Restart your development server after adding environment variables

3. **CORS errors**
   - Ensure `CORS_ORIGIN` is set to your frontend URL
   - Check that `BETTER_AUTH_URL` matches your backend URL

### Development vs Production

- **Development**: Use `http://localhost:3000` for the callback URL
- **Production**: Use your actual domain (e.g., `https://yourdomain.com`)

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique values for `BETTER_AUTH_SECRET`
- Regularly rotate your Google OAuth credentials
- Use HTTPS in production

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
