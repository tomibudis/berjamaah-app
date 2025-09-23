# GitHub Actions Webhook Setup

This document explains how to set up GitHub Actions workflows for the three webhook services in the Berjamaah application.

## Webhook Services

The application has three webhook services:

1. **Activate Programs** (`/api/webhooks/activate-programs`)
   - Activates programs with status 'pending' when their start date is reached
   - Runs every hour at minute 0

2. **Deactivate Programs** (`/api/webhooks/deactivate-programs`)
   - Deactivates programs with status 'active' when their end date is reached
   - Runs every hour at minute 30

3. **Process Scheduled Activation Users** (`/api/webhooks/process-scheduled-activation-users`)
   - Processes users with 'scheduled' status and sends activation emails
   - Runs every 5 minutes

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

### 1. WEBHOOK_SECRET

- **Purpose**: Shared secret for authenticating all webhook requests
- **Value**: A secure random string (e.g., generated with `openssl rand -hex 32`)
- **Usage**: All three webhook services use this same secret

### 2. ACTIVATE_PROGRAMS_WEBHOOK_URL

- **Purpose**: Full URL to the activate programs webhook endpoint
- **Value**: `https://your-domain.com/api/webhooks/activate-programs`
- **Example**: `https://berjamaah.vercel.app/api/webhooks/activate-programs`

### 3. DEACTIVATE_PROGRAMS_WEBHOOK_URL

- **Purpose**: Full URL to the deactivate programs webhook endpoint
- **Value**: `https://your-domain.com/api/webhooks/deactivate-programs`
- **Example**: `https://berjamaah.vercel.app/api/webhooks/deactivate-programs`

### 4. PROCESS_SCHEDULED_ACTIVATION_USERS_WEBHOOK_URL

- **Purpose**: Full URL to the process scheduled activation users webhook endpoint
- **Value**: `https://your-domain.com/api/webhooks/process-scheduled-activation-users`
- **Example**: `https://berjamaah.vercel.app/api/webhooks/process-scheduled-activation-users`

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the name and value as specified above

## Environment Variables

Make sure your application has the following environment variable set:

```bash
WEBHOOK_SECRET=your-secure-random-string
```

This should be the same value as the `WEBHOOK_SECRET` GitHub secret.

## Workflow Files

The following workflow files are created:

- `.github/workflows/activate-programs.yml`
- `.github/workflows/deactivate-programs.yml`
- `.github/workflows/process-scheduled-activation-users.yml`

## Manual Execution

All workflows can be manually triggered from the GitHub Actions tab:

1. Go to **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **Run workflow**

## Monitoring

- Check the **Actions** tab to monitor workflow executions
- Failed workflows will show error messages and HTTP response codes
- Each workflow logs the HTTP status and response for debugging

## Security Notes

- The `WEBHOOK_SECRET` is used to authenticate requests from GitHub Actions
- All webhook endpoints verify the secret before processing
- Use a strong, random secret for production environments
- Never commit secrets to your repository

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that `WEBHOOK_SECRET` matches between GitHub and your application
2. **404 Not Found**: Verify that the webhook URLs are correct and accessible
3. **500 Internal Server Error**: Check your application logs for database or other errors

### Testing Webhooks

You can test webhooks manually using curl:

```bash
# Test activate programs webhook
curl -X POST "https://your-domain.com/api/webhooks/activate-programs" \
  -H "x-webhook-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test deactivate programs webhook
curl -X POST "https://your-domain.com/api/webhooks/deactivate-programs" \
  -H "x-webhook-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test process scheduled activation users webhook
curl -X POST "https://your-domain.com/api/webhooks/process-scheduled-activation-users" \
  -H "x-webhook-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Schedule Adjustments

You can adjust the cron schedules in the workflow files:

- `0 * * * *` = Every hour at minute 0
- `30 * * * *` = Every hour at minute 30
- `*/5 * * * *` = Every 5 minutes

For more cron syntax help, see [crontab.guru](https://crontab.guru/).
