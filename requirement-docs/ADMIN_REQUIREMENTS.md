# BERJAMAAH APP - ADMIN PANEL REQUIREMENTS

## Overview

This document outlines the requirements for the Berjamaah App Admin Panel - a mobile web application for administrators to manage donation programs and verify donations through manual verification workflow.

## 1. ADMIN AUTHENTICATION & ACCESS CONTROL

### 1.1 Admin Login System

- **Feature**: Admin Authentication
- **Description**: Secure authentication for administrators to access the admin panel
- **Requirements**:
  - Login form with email/username and password
  - Session management with secure JWT tokens
  - Role-based access control (Admin only)
  - Mobile-responsive login interface
  - Session timeout management
  - Strong password requirements
  - Activity logging for admin actions

### 1.2 Admin Dashboard

- **Feature**: Admin Dashboard Overview
- **Description**: Main dashboard with key metrics and quick access
- **Requirements**:
  - Mobile-friendly navigation menu
  - Key metrics cards:
    - Pending donations count
    - Total donations (verified)
    - Active programs count
    - Total amount raised
  - Quick action buttons:
    - View pending donations
    - Manage programs
    - Create new program
  - Recent activity feed
  - Summary cards showing verification status

## 2. DONATION MANAGEMENT FEATURES

### 2.1 Pending Donations List

- **Feature**: View Pending Donations
- **Description**: Display list of donations awaiting admin verification
- **Requirements**:
  - Paginated list view optimized for mobile
  - Search and filter functionality:
    - By donor name/email
    - By program
    - By amount range
    - By date range
  - Sort options:
    - By date (newest first)
    - By amount (highest first)
    - By donor name
  - Status indicators:
    - Pending Verification
    - Verified
    - Confirmed
    - Rejected
  - Visual indicators for donations with/without proof images
  - Pull-to-refresh functionality
  - Real-time updates

### 2.2 Donation Details & Manual Verification

- **Feature**: Individual Donation Details with Manual Verification
- **Description**: Detailed view of specific donation with bank transfer proof for manual verification
- **Requirements**:

  - **Donor Information Section**:

    - Donor name, contact, email
    - Donation amount and intended program
    - Donation date and time
    - Donor's bank account details (if provided)
    - Donation reference number

  - **Payment Proof Section**:

    - Uploaded bank transfer receipt/screenshot
    - Image viewer with zoom functionality
    - Multiple image support (if donor uploaded multiple proofs)
    - Image metadata (upload date, file size)
    - Full-screen image viewer
    - Image rotation support
    - Download original image option

  - **Bank Transfer Details**:

    - Transfer amount verification
    - Bank account verification (sender/receiver)
    - Transfer date and time verification
    - Reference number or notes from transfer
    - Bank name and account details

  - **Manual Verification Tools**:
    - Side-by-side comparison of donation amount vs transfer amount
    - Bank account matching verification
    - Date/time validation
    - Notes/comments field for admin verification notes
    - Verification checklist with checkboxes

### 2.3 Manual Verification Process

- **Feature**: Admin Manual Verification Workflow
- **Description**: Step-by-step manual verification process for bank transfers
- **Requirements**:

  - **Verification Checklist**:

    - ✅ Amount matches donation amount
    - ✅ Bank account details verified
    - ✅ Transfer date is valid
    - ✅ Reference number/notes match
    - ✅ Image quality is clear and readable

  - **Verification Actions**:

    - **Approve**: Mark donation as verified and confirmed
    - **Request More Info**: Send message to donor for additional proof
    - **Reject**: Mark as rejected with reason

  - **Verification History**:
    - Track all verification attempts
    - Admin notes and comments
    - Timestamp of verification actions
    - Admin who performed the verification
    - Complete audit trail

### 2.4 Donation Confirmation Process (Manual)

- **Feature**: Confirm Verified Donations
- **Description**: Admin approval workflow for manually verified donations
- **Requirements**:

  - **Pre-verification Check**:

    - Ensure all verification steps are completed
    - Verify bank transfer proof is clear and matches
    - Confirm amount and account details

  - **Confirmation Actions**:

    - One-click confirmation button (only after verification)
    - Confirmation dialog with verification summary
    - Automatic status update to "Confirmed"
    - Update program donation totals
    - Generate confirmation receipt (PDF/image)

  - **Post-Confirmation**:
    - Update donor's donation history
    - Add to program's confirmed donations
    - Create audit trail entry
    - Display success message to admin

### 2.5 Donation Rejection Process (Manual)

- **Feature**: Reject Invalid Donations
- **Description**: Admin rejection workflow for donations that fail manual verification
- **Requirements**:

  - **Rejection Reasons** (Predefined options):

    - Amount doesn't match transfer
    - Bank account details don't match
    - Transfer proof is unclear/invalid
    - Duplicate donation detected
    - Transfer date is too old/invalid
    - Other (custom reason)

  - **Rejection Process**:

    - Select rejection reason from dropdown
    - Add custom notes/explanation
    - Upload rejection evidence (if needed)
    - Confirmation dialog before rejection
    - Automatic status update to "Rejected"

  - **Rejection Documentation**:
    - Detailed rejection report
    - Admin notes and evidence
    - Timestamp and admin information
    - Audit trail for compliance

### 2.6 Bank Transfer Proof Management

- **Feature**: Image Upload and Management System
- **Description**: Handle bank transfer proof images uploaded by donors
- **Requirements**:

  - **Image Upload Support**:

    - Accept common formats (JPG, PNG, PDF)
    - Maximum file size: 5MB per image
    - Multiple image upload per donation
    - Image compression for storage optimization

  - **Image Viewing**:

    - Full-screen image viewer
    - Zoom and pan functionality
    - Image rotation support
    - Download original image option
    - Image metadata display

  - **Image Security**:
    - Secure file storage
    - Access control (admin only)
    - Image watermarking (optional)
    - Automatic image cleanup for rejected donations

## 3. PROGRAM MANAGEMENT FEATURES

### 3.1 Program Management Dashboard

- **Feature**: Program Management Access
- **Description**: Main interface for managing donation programs
- **Requirements**:
  - Mobile-responsive program management page
  - Quick stats:
    - Active programs count
    - Draft programs count
    - Ended programs count
    - Total programs created
  - Quick action buttons:
    - Add New Program
    - View All Programs
    - Manage Active Programs

### 3.2 Create New Program

- **Feature**: Add New Program
- **Description**: Form to create new donation programs
- **Requirements**:
  - **Program Information**:
    - Program title and description
    - Target amount and current progress
    - Program category/type selection
    - Image upload for program banner
    - Rich text editor for description
  - **Program Schedule Options**:
    - **One-time Program**: Create single period with start and end date
    - **Recurring Program**: Create first period with recurring settings
      - Frequency options: Weekly, Monthly, Quarterly, Yearly
      - Activation day selection (e.g., first Monday, 1st of month)
      - Duration per activation (e.g., 7 days, 1 week)
      - Total program duration or number of cycles
      - System will automatically create future periods based on these settings
  - **Mobile Optimization**:
    - Mobile-optimized form layout
    - Auto-save draft functionality
    - Form validation and error handling
    - Image preview before upload

### 3.3 Program Status Management

- **Feature**: Program Lifecycle Management
- **Description**: Manage program statuses (Draft, Active, Ended)
- **Requirements**:
  - **Status Types**:
    - **Draft Status**: Programs saved but not yet active
    - **Active Status**: Live programs accepting donations
    - **Ended Status**: Completed programs
  - **Status Management**:
    - Status change confirmation dialogs
    - Automatic date tracking for program periods
    - Bulk status updates
    - Status change history

### 3.4 Program List & Filtering

- **Feature**: View and Filter Programs
- **Description**: List all programs with filtering capabilities
- **Requirements**:
  - **Filtering Options**:
    - Filter by status (Draft, Active, Ended)
    - Search by program name or description
    - Sort by date, target amount, progress
  - **Display Features**:
    - Card-based layout for mobile
    - Infinite scroll or pagination
    - Program progress indicators
    - Quick action buttons per program

### 3.5 Program Activation

- **Feature**: Activate Draft Programs
- **Description**: Convert draft programs to active status
- **Requirements**:
  - One-click activation from draft status
  - Confirmation dialog with program details
  - Automatic start date recording
  - Entry creation in program_periods table
  - Validation checks before activation
  - Success notification

### 3.6 Program Completion

- **Feature**: End Active Programs
- **Description**: Mark active programs as completed
- **Requirements**:
  - End program confirmation dialog
  - Automatic end date recording
  - Update program_periods table
  - Final statistics and summary
  - Program completion report
  - Archive completed programs

### 3.7 Periodic Program Management

- **Feature**: Manage Recurring Programs
- **Description**: Handle programs that activate periodically (e.g., first week of each month)
- **Requirements**:

  - **Automatic Activation**:

    - System automatically activates programs based on schedule
    - Background job to check and activate scheduled programs
    - Notification to admin when program activates
    - Automatic creation of new program_periods entries

  - **Manual Override**:

    - Admin can manually activate/deactivate periodic programs
    - Skip next activation cycle option
    - Modify schedule for future activations
    - Emergency deactivation during active period

  - **Schedule Management**:

    - View upcoming activation schedule
    - Edit recurring schedule (frequency, duration, end date)
    - Pause/resume periodic activations
    - View activation history and statistics

  - **Status Tracking**:
    - Current status: Scheduled, Active, Inactive, Paused
    - Next activation date and time
    - Number of completed cycles
    - Total donations per cycle
    - Program performance metrics

## 4. TECHNICAL REQUIREMENTS

### 4.1 Mobile-First Design

- **Responsive Design**: Optimized for mobile devices (320px - 768px)
- **Touch-Friendly**: Large buttons, swipe gestures, touch targets
- **Performance**: Fast loading, optimized images, lazy loading
- **Offline Support**: Basic offline functionality for viewing data

### 4.2 Database Schema

**Design Philosophy**: The `programs` table stores master program information (title, description, target), while `program_periods` table manages actual active periods and recurring settings. This separation allows for:

- Clean separation between program definition and scheduling logic
- Easy querying of currently active programs
- Recurring settings stored with periods (not programs)
- Accurate tracking of donations per period
- Flexible scheduling per program instance

**Key Relationships**:

- `programs` → `program_periods` (1:many)
- `program_periods` → `donations` (1:many)
- `programs` → `donations` (1:many, for program info)

**Query for Active Programs (Frontend)**:

```sql
SELECT
  p.id,
  p.title,
  p.description,
  p.target_amount,
  p.banner_image,
  p.category,
  pp.id as period_id,
  pp.start_date,
  pp.end_date,
  pp.current_amount,
  pp.cycle_number
FROM programs p
JOIN program_periods pp ON p.id = pp.program_id
WHERE p.status = 'active'
  AND pp.status = 'active'
  AND pp.start_date <= NOW()
  AND pp.end_date >= NOW()
ORDER BY pp.start_date DESC;
```

```sql
-- Users table (for admins)
users (
  id,
  email,
  password,
  role, -- 'admin'
  full_name,
  phone,
  profile_picture,
  created_at,
  updated_at
)

-- Programs table (master program information)
programs (
  id,
  title,
  description,
  target_amount,
  banner_image,
  category,
  status, -- 'draft', 'active', 'paused', 'ended'
  created_at,
  updated_at
)

-- Program periods table (actual active periods for donations)
program_periods (
  id,
  program_id,
  start_date,
  end_date,
  cycle_number, -- for recurring programs (1, 2, 3, etc.), null for one_time
  status, -- 'scheduled', 'active', 'ended', 'cancelled'
  current_amount, -- total donations received in this period
  -- Recurring settings (only for recurring programs)
  recurring_frequency, -- 'weekly', 'monthly', 'quarterly', 'yearly' (null for one_time)
  recurring_day, -- day of week (1-7) or day of month (1-31) (null for one_time)
  recurring_duration_days, -- how many days each activation lasts (null for one_time)
  total_cycles, -- null for indefinite, number for limited cycles (null for one_time)
  next_activation_date, -- when the next period should be created
  created_at,
  updated_at
)

-- Program schedule logs table
program_schedule_logs (
  id,
  program_id,
  action, -- 'activated', 'deactivated', 'skipped', 'paused', 'resumed'
  scheduled_date,
  actual_date,
  cycle_number,
  admin_id,
  notes,
  created_at
)

-- Donations table (for admin verification)
donations (
  id,
  user_id, -- Reference to donor
  donor_name,
  donor_email,
  donor_phone,
  amount,
  program_id, -- Reference to programs table (for program info)
  program_period_id, -- Reference to program_periods table (for active period)
  status, -- 'pending_verification', 'verified', 'confirmed', 'rejected'
  bank_account_sender,
  bank_account_receiver,
  transfer_date,
  transfer_reference,
  admin_notes,
  verification_attempts,
  verified_by_admin_id,
  verified_at,
  donation_reference_number,
  created_at,
  updated_at
)

-- Donation proof images table
donation_proofs (
  id,
  donation_id,
  image_path,
  image_name,
  file_size,
  uploaded_at,
  is_primary
)

-- Verification history table
verification_history (
  id,
  donation_id,
  admin_id,
  action, -- 'verified', 'rejected', 'requested_info'
  notes,
  created_at
)

-- Admin activity logs
admin_activity_logs (
  id,
  admin_id,
  action,
  target_type, -- 'donation', 'program'
  target_id,
  details,
  created_at
)
```

### 4.3 Core Technologies

- **Frontend**: React.js with mobile-first CSS framework
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL or MySQL
- **Authentication**: JWT tokens
- **File Storage**: Local file system or cloud storage for images
- **Image Processing**: Sharp.js for image optimization
- **PDF Generation**: jsPDF for confirmation receipts

### 4.4 Periodic Program System

- **Background Job System**:

  - Cron job or scheduled task to check for program activations
  - Daily check for programs scheduled to activate
  - Automatic program activation based on schedule
  - Error handling and retry mechanisms for failed activations

- **Schedule Calculation**:

  - Calculate next activation date based on frequency
  - Handle edge cases (month-end, leap years, etc.)
  - Support for different time zones
  - Validation of schedule conflicts

- **Notification System**:
  - Admin notifications for program activations
  - Email alerts for schedule changes
  - Dashboard notifications for upcoming activations
  - Error notifications for failed activations

### 4.5 Security Considerations

- **Data Protection**:

  - Secure file storage for bank transfer proofs
  - Access control for sensitive financial data
  - Audit trails for all admin actions
  - Data encryption for sensitive information

- **Admin Security**:

  - Strong password requirements
  - Session timeout management
  - Role-based access control
  - Activity logging for admin actions

- **Image Security**:
  - Secure upload validation
  - File type and size restrictions
  - Access control for uploaded images
  - Automatic image cleanup for rejected donations

## 5. MVP PRIORITY FEATURES

### Phase 1: Core Admin Features

1. Admin authentication system
2. Basic donation list with pending verification status
3. Donation details view with image proof viewer
4. Manual verification workflow (approve/reject)
5. Basic program creation and listing

### Phase 2: Enhanced Features

1. Advanced filtering and search
2. Program status management (Draft/Active/Ended)
3. Periodic program management (recurring activations)
4. Verification history and audit trails
5. Image management improvements
6. Mobile UI/UX enhancements

### Phase 3: Advanced Features

1. Reporting and analytics
2. Bulk operations
3. Advanced image processing
4. Performance optimizations
5. Additional admin tools

## 6. SUCCESS METRICS

### 6.1 Performance Metrics

- Page load time < 3 seconds
- Image upload success rate > 95%
- Verification completion time < 5 minutes per donation
- Mobile responsiveness score > 90%

### 6.2 User Experience Metrics

- Admin task completion rate > 90%
- Error rate < 5%
- User satisfaction score > 4.0/5.0
- Mobile usability score > 85%

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Admin Panel Requirements - Ready for Development
