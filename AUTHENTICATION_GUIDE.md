# Authentication System Implementation Guide

This document explains the complete authentication system implemented in your study_server project, including JWT tokens, email verification, password reset, and the Brevo email service integration.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [API Endpoints](#api-endpoints)
5. [How Authentication Works](#how-authentication-works)
6. [Email Service (Brevo)](#email-service-brevo)
7. [Protected Routes](#protected-routes)
8. [Testing the Endpoints](#testing-the-endpoints)

---

## Overview

The authentication system provides:
- **User Registration** - Register with email and password
- **Email Verification** - Users must verify email via link sent to their inbox
- **Login** - Authenticate with email and password, receive JWT token
- **Password Reset** - Forgot password flow with email verification
- **Protected Routes** - JWT middleware to protect endpoints
- **Brevo Integration** - Send emails for verification and password reset

---

## Architecture

### Components

```
src/
├── controller/
│   ├── Auth.controller.ts      # Authentication endpoints
│   └── User.controller.ts      # User CRUD endpoints
├── service/
│   └── userService.ts          # Business logic (authentication methods)
├── models/
│   └── Usermodel.ts            # User entity with auth fields
├── midlleware/
│   ├── auth.ts                 # JWT verification middleware
│   ├── asynchandler.ts         # Async error handling
│   └── requestLogger.ts        # Request logging
├── routes/
│   ├── auth.rout.ts            # Authentication routes
│   ├── user.rout.ts            # User CRUD routes
│   └── index.ts                # Route aggregator
├── util/
│   ├── jwt.ts                  # JWT token generation/verification
│   ├── emailService.ts         # Brevo email sending
│   └── exceptions/http/
│       ├── UnauthorizedException.ts
│       ├── ForbiddenException.ts
│       └── (other exceptions)
└── config/
    └── index.ts                # Environment config
```

### Data Flow

```
User Request
    ↓
Route Handler
    ↓
[Middleware: asyncHandler, authenticate (if protected)]
    ↓
Controller
    ↓
Service (Business Logic)
    ↓
Repository (Database)
    ↓
Response
```

---

## Setup & Configuration

### 1. Environment Variables

Create a `.env` file in project root with the following variables:

```bash
# Server
PORT=4000
HOST=localhost
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=24h

# Brevo Email Service
# Get API key from https://app.brevo.com/
BREVO_API_KEY=your-brevo-api-key-here
SENDER_EMAIL=noreply@yourapp.com
SENDER_NAME=Your App Name

# Base URL for email links
BASE_URL=http://localhost:4000
# In production: BASE_URL=https://yourdomain.com
```

### 2. Get Brevo API Key

1. Go to [Brevo (formerly Sendinblue)](https://app.brevo.com/)
2. Sign up or login to your account
3. Navigate to **Settings → API Keys**
4. Create a new API key or copy existing one
5. Add it to your `.env` file as `BREVO_API_KEY`

### 3. Install Dependencies

All required dependencies are already installed:
```bash
npm install jsonwebtoken @types/jsonwebtoken bcrypt brevo axios dotenv
```

---

## API Endpoints

### Base URL: `http://localhost:4000/auth`

### 1. Register User

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully. Please verify your email.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "createdAt": "2024-02-06T12:00:00Z"
  }
}
```

**What Happens:**
1. Validates input (name, email, password, confirmPassword)
2. Checks if email already registered
3. Hashes password using bcrypt (10 salt rounds)
4. Creates user in database with `emailVerified = false`
5. Sends verification email to user's inbox
6. Returns JWT token for future authenticated requests

**Verification Email Contains:**
- Welcome message
- Link to verify email: `http://localhost:4000/auth/verify/{userId}`
- Note: Link expires in 24 hours

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "createdAt": "2024-02-06T12:00:00Z"
  }
}
```

**What Happens:**
1. Validates email and password provided
2. Finds user by email in database
3. Compares provided password with hashed password in DB (bcrypt)
4. If valid, generates and returns JWT token
5. Client stores token and uses it for authenticated requests

**JWT Token Contains:**
- `userId` - User's unique ID
- `email` - User's email
- `expiresIn` - Token validity (default 24h)

---

### 3. Verify Email

**Endpoint:** `POST /auth/verify/:userId`

**Description:** Verify user's email address (called from email link)

**URL Parameters:**
- `userId` - The user ID from verification email link

**Request Body:** (empty)
```json
{}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "createdAt": "2024-02-06T12:00:00Z"
  }
}
```

**What Happens:**
1. Gets userId from URL parameter
2. Finds user in database
3. Sets `emailVerified = true`
4. Updates user in database
5. Sends welcome email
6. Returns updated user data

**Welcome Email Contains:**
- Congratulation message
- Instructions to login
- Link to login page (optional)

---

### 4. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request password reset email

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If this email exists in our system, you will receive a password reset link shortly"
}
```

**What Happens:**
1. Validates email provided
2. Finds user by email (silently returns if not found for security)
3. Generates random reset token
4. Sets token expiry to 1 hour
5. Saves token in database
6. Sends password reset email with unique link

**Reset Email Contains:**
- Password reset request message
- Link: `http://localhost:4000/auth/reset-password/{resetToken}`
- Note: Link expires in 1 hour
- Security notice if user didn't request reset

**Security Note:** Response message is same whether email exists or not (prevents account enumeration)

---

### 5. Reset Password

**Endpoint:** `POST /auth/reset-password/:resetToken`

**Description:** Reset password using token from email

**URL Parameters:**
- `resetToken` - Token received in password reset email

**Request Body:**
```json
{
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "createdAt": "2024-02-06T12:00:00Z"
  }
}
```

**What Happens:**
1. Gets reset token from URL
2. Finds user with matching reset token
3. Validates token hasn't expired (must be within 1 hour)
4. Validates new password (min 6 characters)
5. Hashes new password
6. Updates user with new password
7. Clears reset token from database
8. Returns success

**Error Cases:**
- Token not found → 404 Not Found
- Token expired → 400 Bad Request "Reset token has expired"
- Passwords don't match → 400 Bad Request "Passwords do not match"
- Password too short → 400 Bad Request "Password must be at least 6 characters"

---

### 6. Get Current User (Protected Route)

**Endpoint:** `GET /auth/me`

**Description:** Get current user's profile (requires JWT token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:** (empty)

**Response (200 OK):**
```json
{
  "message": "User profile retrieved",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "createdAt": "2024-02-06T12:00:00Z"
  }
}
```

**What Happens:**
1. Middleware `authenticate` extracts token from header
2. Verifies token signature and expiry
3. Extracts userId from token
4. Finds user in database
5. Returns user data

**Error Cases:**
- Missing Authorization header → 401 Unauthorized
- Invalid token → 401 Unauthorized "Invalid or expired token"
- Token expired → 401 Unauthorized "Invalid or expired token"
- User not found → 404 Not Found

---

## How Authentication Works

### Step-by-Step: Registration & Verification

```
1. User submits registration form
   ↓
2. POST /auth/register {name, email, password, confirmPassword}
   ↓
3. AuthController.register() validates inputs
   ↓
4. UserService.register()
   │  - Check email not already registered
   │  - Hash password: bcrypt.hash(password, 10)
   │  - Create User object with emailVerified=false
   │  - Save to database
   │  - Generate JWT token
   │  - Send verification email
   ↓
5. Email received with verification link
   ↓
6. User clicks link: /auth/verify/{userId}
   ↓
7. AuthController.verifyEmail()
   │  - Find user by userId
   │  - Set emailVerified = true
   │  - Save to database
   │  - Send welcome email
   ↓
8. User can now login
```

### Step-by-Step: Login

```
1. User submits login form
   ↓
2. POST /auth/login {email, password}
   ↓
3. AuthController.login() validates inputs
   ↓
4. UserService.login(email, password)
   │  - Find user by email
   │  - Compare password: bcrypt.compare(password, hashedPassword)
   │  - If match: generateToken(userId, email)
   ↓
5. Server returns JWT token
   ↓
6. Client stores token (localStorage, sessionStorage, cookie)
   ↓
7. For all future requests, client includes:
   Authorization: Bearer {token}
```

### Step-by-Step: Protected Route Access

```
1. Client makes request to protected endpoint
   ↓
2. Request includes: Authorization: Bearer {token}
   ↓
3. Middleware: authenticate(req, res, next)
   │  - Extract token from header
   │  - Verify token signature with JWT_SECRET
   │  - Check token not expired
   │  - Extract userId and email from token
   │  - Attach to req.userId and req.userEmail
   ↓
4. Controller has access to req.userId
   ↓
5. Process request and return response
```

---

## Email Service (Brevo)

### How Email Sending Works

```
1. AuthService triggers email function
   ↓
2. emailService.sendVerificationEmail(email, link, name)
   ↓
3. Prepares email payload:
   {
     "sender": {
       "name": "Your App",
       "email": "noreply@yourapp.com"
     },
     "to": [{"email": "user@example.com", "name": "User"}],
     "subject": "Verify Your Email Address",
     "htmlContent": "..."
   }
   ↓
4. HTTP POST to Brevo API:
   POST https://api.brevo.com/v3/smtp/email
   Headers: {"api-key": BREVO_API_KEY}
   ↓
5. Brevo sends email to recipient
   ↓
6. Log success or error
```

### Brevo API Integration

**File:** `src/util/emailService.ts`

**Functions:**
- `sendEmail(options)` - Generic email sender
- `sendVerificationEmail(email, link, name)` - Verification email
- `sendPasswordResetEmail(email, link, name)` - Password reset email
- `sendWelcomeEmail(email, name)` - Welcome email

**Error Handling:**
- Logs error but doesn't throw (graceful degradation)
- App continues even if email fails
- In production, consider queuing failed emails for retry

### Customizing Email Templates

To customize email content, edit `src/util/emailService.ts`:

```typescript
// Example: Edit welcome email
export async function sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const htmlContent = `
        <h2>Welcome, ${userName}!</h2>
        <p>Your custom message here</p>
        <p><a href="http://yourapp.com/dashboard">Go to Dashboard</a></p>
    `;
    
    await sendEmail({
        to: email,
        subject: 'Welcome to Your App!',
        htmlContent,
        recipientName: userName
    });
}
```

---

## Protected Routes

### Making an Endpoint Protected

Add `authenticate` middleware to routes that require JWT:

```typescript
// auth.rout.ts
import { authenticate } from '../midlleware/auth';

// Protected route
router.get('/me', 
    authenticate,  // Add this middleware
    asyncHandler(authController.getCurrentUser.bind(authController))
);
```

### Using in Other Routes

```typescript
// user.rout.ts
import { authenticate } from '../midlleware/auth';

// Protected: Update own profile
router.put('/profile', 
    authenticate,
    asyncHandler(userController.UpdateUser.bind(userController))
);

// Protected: Delete own account
router.delete('/:id',
    authenticate,
    asyncHandler(userController.DeleteUser.bind(userController))
);
```

### Accessing User Info in Controller

```typescript
public async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.userId; // Added by authenticate middleware
    const userEmail = req.userEmail; // Added by authenticate middleware
    
    // Use userId to update user's own data
    const user = await this.userService.getUser(userId);
    // ...
}
```

---

## Testing the Endpoints

### Using Postman

#### 1. Register New User
```
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### 2. Verify Email
```
POST http://localhost:4000/auth/verify/{userId}
Content-Type: application/json

{}
```

#### 3. Login
```
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Copy the token from response.

#### 4. Get Current User (Protected)
```
GET http://localhost:4000/auth/me
Authorization: Bearer {token_from_login}
Content-Type: application/json
```

#### 5. Forgot Password
```
POST http://localhost:4000/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 6. Reset Password
```
POST http://localhost:4000/auth/reset-password/{resetToken}
Content-Type: application/json

{
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

---

## Key Security Features

1. **Password Hashing** - bcrypt with 10 salt rounds
2. **JWT Tokens** - Signed with secret, expiry validation
3. **Email Verification** - Prevents fake email registration
4. **Token Expiry** - Tokens expire after 24 hours
5. **Reset Token Expiry** - Reset links valid for only 1 hour
6. **Secure Error Messages** - No account enumeration attacks
7. **Token in Headers** - Recommended over cookies for CORS APIs
8. **HTTPS in Production** - Always use HTTPS with tokens

---

## Database Schema Update

Your User model now includes:

```typescript
class User {
    id: string;                    // Unique user ID
    name: string;                  // User's name
    email: string;                 // User's email
    password: string;              // Hashed password
    emailVerified: boolean;        // Email verification status
    resetToken?: string;           // Password reset token
    resetTokenExpiry?: Date;       // Reset token expiration
    createdAt: Date;              // Account creation date
}
```

---

## Troubleshooting

### Email Not Sending
1. Check `BREVO_API_KEY` in `.env`
2. Verify API key is valid in Brevo dashboard
3. Check sender email is verified in Brevo
4. Look for errors in application logs

### Token Verification Failed
1. Ensure token is complete (no truncation)
2. Check `JWT_SECRET` matches between encoding and decoding
3. Verify token hasn't expired
4. Token format should be: `Authorization: Bearer {token}`

### Password Reset Token Expired
1. Reset tokens valid for 1 hour (configurable)
2. User must request new reset email after expiry
3. Check server time synchronization

---

## Next Steps

1. **Connect Database** - Update User repository to save to actual database
2. **Add Rate Limiting** - Prevent brute force attacks on login
3. **Add 2FA** - Two-factor authentication
4. **Email Confirmation** - Send confirmation after password change
5. **Refresh Tokens** - Implement refresh token rotation
6. **HTTPS** - Always use HTTPS in production
7. **CORS** - Configure CORS properly for your frontend

---

## Files Created/Modified

### New Files
- `src/controller/Auth.controller.ts` - Authentication endpoints
- `src/routes/auth.rout.ts` - Auth routes
- `src/midlleware/auth.ts` - JWT middleware
- `src/util/jwt.ts` - JWT utilities
- `src/util/emailService.ts` - Brevo email service
- `src/util/exceptions/http/UnauthorizedException.ts` - Auth exception
- `src/util/exceptions/http/ForbiddenException.ts` - Authorization exception
- `.env.example` - Example environment variables

### Modified Files
- `src/models/Usermodel.ts` - Added auth fields
- `src/service/userService.ts` - Added auth methods
- `src/routes/index.ts` - Added auth routes
- `src/config/index.ts` - Added JWT & Brevo config
- `src/util/IDgenerater.ts` - Added generateUniqueId export

---

## Questions?

Refer to the inline code comments in each file for detailed explanations of how each component works.
