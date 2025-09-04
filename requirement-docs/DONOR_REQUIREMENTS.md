# BERJAMAAH APP - DONOR REQUIREMENTS

## Overview

This document outlines the requirements for the Berjamaah App Donor Interface - a mobile web application for donors to view programs and make donations through bank transfer with manual verification workflow.

## 1. DONOR AUTHENTICATION

### 1.1 Donor Login System

- **Feature**: Donor Authentication
- **Description**: Secure authentication for donors to access the application
- **Requirements**:
  - Login form with email/username and password
  - Registration form for new donors
  - Session management with secure JWT tokens
  - Mobile-responsive login interface
  - "Remember me" functionality
  - Password reset capability
  - Email verification for new accounts

### 1.2 Donor Registration

- **Feature**: New Donor Registration
- **Description**: Allow new users to create donor accounts
- **Requirements**:
  - **Registration Form**:
    - Full name (required)
    - Email address (required, unique)
    - Phone number (optional)
    - Password with strength validation
    - Confirm password
    - Terms and conditions acceptance
  - **Validation**:
    - Email format validation
    - Password strength requirements
    - Duplicate email prevention
    - Real-time form validation
  - **Post-Registration**:
    - Email verification (optional)
    - Welcome message
    - Redirect to program list

## 2. PROGRAM DISCOVERY FEATURES

### 2.1 Program List Page

- **Feature**: View Active Programs
- **Description**: Main page displaying all active donation programs
- **Requirements**:

  - **Active Program Detection**:

    - System checks for programs with status = "Active"
    - Real-time status updates
    - Automatic filtering of inactive programs

  - **Program Display**:

    - Card-based layout optimized for mobile
    - Program title, description, and banner image (optional)
    - Progress bar showing donation progress (current/target amount)
    - Program duration and end date
    - Donation count and recent activity
    - Program category/type indicator

  - **Empty State Handling**:

    - Display message "Belum ada program aktif" when no active programs
    - Friendly illustration or icon
    - Option to refresh or check back later
    - Contact information for inquiries

  - **Mobile Optimization**:
    - Swipe gestures for program cards
    - Pull-to-refresh functionality
    - Infinite scroll or pagination
    - Touch-friendly program selection
    - Fast loading with image optimization

### 2.2 Program Details View

- **Feature**: Detailed Program Information
- **Description**: Comprehensive view of selected program details
- **Requirements**:

  - **Program Information**:

    - Full program description with rich text formatting
    - Target amount and current progress
    - Program duration (start date to end date)
    - Program category and type
    - High-quality program banner image
    - Program organizer information

  - **Progress Visualization**:

    - Visual progress bar with percentage
    - Amount raised vs target amount
    - Number of donors contributed
    - Time remaining (if applicable)
    - Recent donation activity

  - **Program Statistics**:

    - Recent donations list (anonymous)
    - Average donation amount
    - Donation frequency
    - Program milestones achieved
    - Impact stories (if available)

  - **Navigation**:
    - Back button to return to program list
    - Prominent "Donasi" (Donate) button
    - Share program functionality
    - Bookmark/favorite program (optional)

## 3. DONATION PROCESS

### 3.1 Donation Initiation

- **Feature**: Start Donation Process
- **Description**: Begin the donation workflow for selected program
- **Requirements**:
  - Prominent "Donasi" (Donate) button on program details
  - Confirmation dialog before proceeding
  - Donor information pre-filled (if logged in)
  - Guest donation option (without account)
  - Terms and conditions display
  - Donation amount suggestions

### 3.2 Donation Amount Input

- **Feature**: Enter Donation Amount
- **Description**: Allow donors to specify their donation amount
- **Requirements**:
  - **Amount Input**:
    - Amount input field with currency formatting (IDR)
    - Quick amount buttons (preset amounts: 25K, 50K, 100K, 250K, 500K, 1M)
    - Custom amount input with validation
    - Minimum amount: 10,000 IDR
    - Maximum amount: 10,000,000 IDR
    - Real-time amount validation
  - **Amount Display**:
    - Clear currency formatting
    - Amount confirmation display
    - Impact preview (what the amount can achieve)

### 3.3 Payment Method Selection

- **Feature**: Bank Transfer Payment
- **Description**: Display bank transfer information for donation
- **Requirements**:
  - **Bank Transfer Information**:
    - Bank account details for transfer
    - Account number, bank name, account holder name
    - QR code for easy bank transfer (optional)
    - Transfer instructions and notes
    - Reference number for transfer
  - **Transfer Instructions**:
    - Step-by-step transfer guide
    - Important notes for transfer
    - Transfer deadline information
    - Contact information for assistance

### 3.4 Donation Confirmation

- **Feature**: Review and Confirm Donation
- **Description**: Final review before donation submission
- **Requirements**:
  - **Review Section**:
    - Donation amount confirmation
    - Program information review
    - Donor information confirmation
    - Bank transfer details
  - **Confirmation Actions**:
    - Terms and conditions acceptance
    - Privacy policy acceptance
    - Final confirmation button
    - Cancel/back option

## 4. BANK TRANSFER PROOF UPLOAD

### 4.1 Image Upload Interface

- **Feature**: Upload Transfer Proof
- **Description**: Donors upload proof of bank transfer
- **Requirements**:
  - **Upload Options**:
    - Camera capture option (mobile)
    - Gallery selection option
    - Multiple image upload support (max 3 images)
    - Image preview before upload
    - File format validation (JPG, PNG, PDF)
    - File size validation (max 5MB per image)
  - **Upload Process**:
    - Progress indicator during upload
    - Image compression for optimization
    - Upload success/failure feedback
    - Retry mechanism for failed uploads
    - Image quality validation

### 4.2 Transfer Details Form

- **Feature**: Bank Transfer Information
- **Description**: Collect bank transfer details from donor
- **Requirements**:
  - **Transfer Information**:
    - Bank account sender information
    - Transfer amount confirmation
    - Transfer date and time
    - Reference number or notes
    - Bank name and account details
  - **Form Validation**:
    - Required field validation
    - Amount matching validation
    - Date validation (not future date)
    - Real-time form validation

## 5. DONATION SUBMISSION & TRACKING

### 5.1 Donation Submission

- **Feature**: Submit Donation
- **Description**: Complete donation submission process
- **Requirements**:
  - **Submission Process**:
    - System records donation transaction
    - Generate unique donation reference number
    - Store donation with "pending_verification" status
    - Send confirmation to donor
    - Update program progress (pending verification)
  - **Reference Number**:
    - Unique identifier for tracking
    - Easy to remember format
    - Display prominently to donor

### 5.2 Success Notification

- **Feature**: Donation Success Feedback
- **Description**: Confirm successful donation submission
- **Requirements**:
  - **Success Message**:
    - Success message with donation reference
    - Estimated verification time (24-48 hours)
    - Next steps information
    - Option to view donation history
    - Share donation option (optional)
  - **Next Steps**:
    - How to track donation status
    - Contact information for questions
    - Program updates notification

### 5.3 Donation Status Tracking

- **Feature**: Track Donation Status
- **Description**: Monitor donation verification progress
- **Requirements**:
  - **Status Updates**:
    - Real-time status updates
    - Status indicators: Pending, Verified, Confirmed, Rejected
    - Status change notifications
    - Estimated processing time
  - **Status Meanings**:
    - **Pending**: Awaiting admin verification
    - **Verified**: Admin confirmed transfer proof
    - **Confirmed**: Donation officially accepted
    - **Rejected**: Donation rejected with reason

## 6. DONATION HISTORY

### 6.1 History List

- **Feature**: View Donation History
- **Description**: Donors can view their past donations
- **Requirements**:
  - **History Display**:
    - Chronological list of all donations
    - Program name and donation amount
    - Donation date and status
    - Reference number for each donation
    - Filter by status or program
  - **Mobile Optimization**:
    - Card-based layout
    - Swipe actions
    - Pull-to-refresh
    - Infinite scroll

### 6.2 Donation Details

- **Feature**: Individual Donation Details
- **Description**: Detailed view of specific donations
- **Requirements**:
  - **Detail Information**:
    - Program information and progress
    - Payment proof images
    - Verification status and notes
    - Receipt download (for confirmed donations)
    - Donation timeline
  - **Actions**:
    - Download receipt
    - Share donation (optional)
    - Contact support

### 6.3 Donation Statistics

- **Feature**: Personal Donation Statistics
- **Description**: Overview of donor's contribution history
- **Requirements**:
  - **Statistics Display**:
    - Total amount donated
    - Number of programs supported
    - Donation frequency
    - Impact summary
    - Monthly/yearly breakdown
  - **Achievements**:
    - Donation milestones
    - Program completion badges
    - Impact certificates (optional)

## 7. USER PROFILE MANAGEMENT

### 7.1 Profile Information

- **Feature**: Donor Profile Management
- **Description**: Manage donor account information
- **Requirements**:
  - **Profile Details**:
    - Personal details (name, email, phone)
    - Profile picture upload
    - Address information (optional)
  - **Profile Editing**:
    - Edit personal information
    - Update contact details
    - Change profile picture

## 8. TECHNICAL REQUIREMENTS

### 8.1 Mobile-First Design

- **Responsive Design**: Optimized for mobile devices (320px - 768px)
- **Touch-Friendly**: Large buttons, swipe gestures, touch targets
- **Performance**: Fast loading, optimized images, lazy loading
- **Offline Support**: Basic offline functionality for viewing data

### 8.2 Database Schema

**Design Philosophy**: The `programs` table stores master program information (title, description, target), while `program_periods` table manages actual active periods and recurring settings. This separation allows for:

- Clean separation between program definition and scheduling logic
- Easy querying of currently active programs
- Recurring settings stored with periods (not programs)
- Accurate tracking of donations per period
- Flexible scheduling per program instance

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
-- Users table (for donors)
users (
  id,
  email,
  password,
  role, -- 'donor'
  full_name,
  phone,
  profile_picture,
  address,
  notification_preferences,
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

-- Donations table
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

```

### 8.3 Core Technologies

- **Frontend**: React.js with mobile-first CSS framework
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL or MySQL
- **Authentication**: JWT tokens
- **File Storage**: Local file system or cloud storage for images
- **Image Processing**: Sharp.js for image optimization
- **PDF Generation**: jsPDF for donation receipts

### 8.4 User Experience Requirements

- **Navigation**: Bottom navigation bar for mobile
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: < 3 second page load times
- **Offline Support**: View cached program data

## 9. MVP PRIORITY FEATURES

### Phase 1: Core Donor Features

1. Donor authentication and registration
2. Program list page with active programs
3. Program details view
4. Basic donation process with bank transfer
5. Image upload for transfer proof
6. Donation history and status tracking

### Phase 2: Enhanced Features

1. Advanced program filtering and search
2. Donation statistics and achievements
3. Enhanced profile management
4. Push notifications for status updates
5. Social sharing features

### Phase 3: Advanced Features

1. Recurring donations
2. Donation goals and challenges
3. Community features
4. Advanced analytics
5. Multi-language support

## 10. SUCCESS METRICS

### 10.1 Performance Metrics

- Page load time < 3 seconds
- Image upload success rate > 95%
- Donation completion rate > 80%
- Mobile responsiveness score > 90%

### 10.2 User Experience Metrics

- Donor task completion rate > 85%
- Error rate < 5%
- User satisfaction score > 4.0/5.0
- Mobile usability score > 85%
- Donation conversion rate > 15%

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Donor Requirements - Ready for Development
