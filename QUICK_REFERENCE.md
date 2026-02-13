# Authentication System - Quick Reference

## What Was Implemented

A complete authentication system with:
✅ User Registration with email verification
✅ Login with JWT tokens
✅ Password reset/forgot password flow
✅ Email service using Brevo
✅ Protected routes with JWT middleware
✅ Account verification via email links

---

## Quick Setup

### 1. Configure .env
```bash
PORT=4000
NODE_ENV=development

# Get from https://app.brevo.com/
BREVO_API_KEY=your-api-key-here
SENDER_EMAIL=noreply@yourapp.com
SENDER_NAME=Your App

JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

BASE_URL=http://localhost:4000
```

### 2. Start Server
```bash
npm run dev
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/auth/register` | Create new account | ❌ |
| POST | `/auth/login` | Login & get token | ❌ |
| POST | `/auth/verify/:userId` | Verify email | ❌ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/reset-password/:token` | Reset password with token | ❌ |
| GET | `/auth/me` | Get current user profile | ✅ |

---

## Registration Flow

```
User → POST /auth/register
       ↓
       Create account, hash password
       ↓
       Send verification email
       ↓
User clicks email link → POST /auth/verify/{userId}
       ↓
       Mark email verified
       ↓
User → POST /auth/login
       ↓
       Get JWT token
```

---

## Login & Protected Routes

```
POST /auth/login
  ↓ Email + Password
  ↓ Verify credentials
  ↓ Return JWT token
  ↓

Client stores token

For protected endpoint:
GET /auth/me
  ↓
  Header: "Authorization: Bearer {token}"
  ↓
  Middleware verifies token
  ↓
  Extract user info from token
  ↓
  Return user data
```

---

## Password Reset Flow

```
User → POST /auth/forgot-password {email}
       ↓
       Generate reset token (1 hour validity)
       ↓
       Send email with reset link
       ↓

User clicks link with reset token
     ↓
     POST /auth/reset-password/{resetToken}
     {password, confirmPassword}
     ↓
     Hash new password
     ↓
     Update user in database
     ↓
     Clear reset token
     ↓
     Success!
```

---

## File Structure

```
src/
├── controller/Auth.controller.ts      # Handles HTTP requests
├── service/userService.ts             # Business logic (auth methods)
├── models/Usermodel.ts                # User with auth fields
├── routes/auth.rout.ts                # Route definitions
├── midlleware/auth.ts                 # JWT verification
├── util/
│   ├── jwt.ts                         # Token generation/verification
│   ├── emailService.ts                # Brevo email sender
│   └── exceptions/http/
│       ├── UnauthorizedException.ts
│       └── ForbiddenException.ts
└── config/index.ts                    # Environment config
```

---

## Code Example: Using Auth

### Register User
```typescript
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "confirmPassword": "secure123"
}

// Response
{
  "message": "User registered successfully. Please verify your email.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { id, name, email, emailVerified: false }
}
```

### Verify Email
```
User clicks: http://localhost:4000/auth/verify/{userId}

Endpoint receives: POST /auth/verify/{userId}
Response: { message: "Email verified successfully", user: {...} }
```

### Login
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}

// Response
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### Access Protected Endpoint
```
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Response
{
  "message": "User profile retrieved",
  "user": { id, name, email, emailVerified: true }
}
```

---

## How Each Part Works

### 1. Registration (src/controller/Auth.controller.ts)
- Validates input
- Creates User object with unique ID
- Calls userService.register()

### 2. Service Layer (src/service/userService.ts)
- Checks email doesn't exist
- **Hashes password** with bcrypt (10 rounds)
- Saves user to database
- **Generates JWT token**
- **Sends verification email** via Brevo
- Returns token and user

### 3. JWT Middleware (src/midlleware/auth.ts)
- Extracts token from "Authorization: Bearer {token}" header
- **Verifies token signature** with JWT_SECRET
- Checks token isn't expired
- Extracts userId and email from token
- Attaches to request object

### 4. Email Service (src/util/emailService.ts)
- Prepares email payload
- Makes HTTP POST to Brevo API
- Brevo sends actual email to recipient
- Logs success/error

---

## Key Concepts Explained

### bcrypt (Password Hashing)
```
Plain text password: "secure123"
     ↓
bcrypt.hash(password, 10)  // 10 salt rounds
     ↓
Hashed password: "$2b$10$N9qo8uLO..."
     ↓
Stored in database

On login:
Provided password: "secure123"
     ↓
bcrypt.compare("secure123", "$2b$10$N9qo8uLO...")
     ↓
true/false
```

### JWT (JSON Web Tokens)
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { userId: "123", email: "john@example.com", exp: 1707240000 }
Secret: "your-secret-key"
     ↓
jwt.sign({ userId, email }, secret, { expiresIn: "24h" })
     ↓
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"

On request:
Extract token from header
     ↓
jwt.verify(token, secret)
     ↓
Returns: { userId: "123", email: "john@example.com" }
Or error if invalid/expired
```

### Brevo API Integration
```
Email to send → emailService.sendEmail(options)
     ↓
Prepare payload with sender, recipient, subject, content
     ↓
HTTP POST https://api.brevo.com/v3/smtp/email
Headers: { "api-key": "your-brevo-api-key" }
Body: { sender, to, subject, htmlContent }
     ↓
Brevo servers process
     ↓
Email delivered to recipient
```

---

## Security Features

✅ **Password Hashing** - bcrypt prevents password exposure  
✅ **Token Expiry** - 24 hour token validity  
✅ **Token Signature** - JWT signed with secret  
✅ **Email Verification** - Prevents fake emails  
✅ **Reset Token Expiry** - 1 hour validity for reset links  
✅ **Secure Error Messages** - No account enumeration  
✅ **Authorization Header** - Tokens not in URL  

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Email not sending | Check BREVO_API_KEY in .env |
| Token verification fails | Ensure complete token, check JWT_SECRET |
| Reset link expired | Valid for 1 hour, request new one |
| Password too weak | Min 6 characters required |
| User already exists | Use different email address |

---

## Next Steps (Optional Enhancements)

1. **Rate Limiting** - Prevent brute force login attempts
2. **2FA** - Two-factor authentication
3. **Social Login** - Google, GitHub OAuth
4. **Refresh Tokens** - Long-lived refresh token flow
5. **Email Confirmation** - After password change
6. **Account Lockout** - After N failed login attempts

---

## Important Files to Review

1. **AUTHENTICATION_GUIDE.md** - Full detailed guide
2. **src/util/jwt.ts** - JWT token logic
3. **src/util/emailService.ts** - Email sending logic
4. **src/midlleware/auth.ts** - Protected route middleware
5. **src/service/userService.ts** - Auth business logic

---

## Testing with Postman

1. Register: `POST /auth/register` with {name, email, password, confirmPassword}
2. Verify: `POST /auth/verify/{userId}` from email
3. Login: `POST /auth/login` with {email, password} → get token
4. Protected: `GET /auth/me` with `Authorization: Bearer {token}`
5. Forgot: `POST /auth/forgot-password` with {email}
6. Reset: `POST /auth/reset-password/{token}` with {password, confirmPassword}

---

**Implementation Complete!** 🎉

All endpoints are ready to test. Follow the guide above to integrate with your frontend.
