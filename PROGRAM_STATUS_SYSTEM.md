# Program Status System

## Overview

The program status system has been simplified to use only start and end dates with automatic status management.

## Program Status Logic

### Status Rules

1. **Pending Status**:
   - When only start date is provided
   - When both start and end dates are provided
2. **Active Status**:
   - When only end date is provided (program is active immediately)

## Webhook Endpoints

### 1. Activation Webhook

**Endpoint**: `/api/webhooks/activate-programs`

**Purpose**: Activates programs with `pending` status when their start date has been reached.

**Method**: POST
**Headers**: `Authorization: Bearer <API_KEY>`

**Response**:

```json
{
  "success": true,
  "message": "Activated X programs",
  "activatedPrograms": [
    {
      "id": "program_id",
      "title": "Program Title",
      "status": "active",
      "activatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Deactivation Webhook

**Endpoint**: `/api/webhooks/deactivate-programs`

**Purpose**: Ends programs with `active` status when their end date has been reached.

**Method**: POST
**Headers**: `Authorization: Bearer <API_KEY>`

**Response**:

```json
{
  "success": true,
  "message": "Deactivated X programs",
  "deactivatedPrograms": [
    {
      "id": "program_id",
      "title": "Program Title",
      "status": "ended",
      "endedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Testing Endpoints

Both webhooks support GET requests for testing:

- `GET /api/webhooks/activate-programs` - Shows programs ready for activation
- `GET /api/webhooks/deactivate-programs` - Shows programs ready for deactivation

## Scheduled Execution

These webhooks should be called periodically (e.g., every hour) by a cron job or scheduled task to:

1. Activate programs that have reached their start date
2. End programs that have reached their end date

## Form Changes

The add program form has been simplified:

- Removed program type selection (only one type now)
- Start date and end date are both optional
- Status is automatically determined based on which dates are provided
- Real-time status indicator shows the expected program status

## Database Changes

Programs now use the `initialPeriod` structure in the main create mutation with:

- `startDate`: When the program should become active
- `endDate`: When the program should end
- `cycleNumber`: Always set to 1 for the initial period
