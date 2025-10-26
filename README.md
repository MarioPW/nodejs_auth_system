# Auth System with NodeJS + TypeScript

## Overview
This project is a RESTful API built with Express.js and TypeScript, using Sequelize for ORM and Jest for testing. It includes various authentication and user management endpoints, including password reset functionality. Additionally, it supports social authentication (social_auth) using OAuth2 with providers like Google, GitHub, and Microsoft.

## Prerequisites
Make sure you have the following tools and libraries installed:
- **Node.js** (v16+ recommended) 
- **npm**, **pnpm**(recommended), or **yarn**
- **PostgreSQL** (database)

# Environment Configuration File

This `.env` file contains the necessary configurations and secrets for the application. Ensure this file remains secure and is not shared publicly.

## Environment Variables
```js 
// ============================================
// Database Configuration
// ============================================

DB_HOST=localhost // Hostname or IP address of the database server
DB_PORT=5432 // Port number on which the database server is running
DB_NAME=medical_db // Name of the database to connect to
DB_USER=postgres // Username for authenticating with the database
DB_PASSWORD=1234 // Password for authenticating with the database
// All roles in a single variable separated by commas
APP_ROLES=ADMIN,GUEST,MODERATOR or any role you need in your system. // Default role: AUTH_USER; this will be assigned to new users or if no role is provided.

// ============================================
// Application Configuration
// ============================================

APP_NAME=your_app_name // Application name (Optional)
NODE_ENV=development // Allowed values: `development`, `production`. Determines security configurations (e.g., HTTPS, cookies).
PORT=3000 // Port number on which the application server listens. Example: `3000`.
ROOT_DOMAIN=http://localhost:3000
FRONTEND_URL=www.frontend_url.com/ // The user will be redirected to this URL after authenticating with social_auth.

// ============================================
// JWT Configuration
// ============================================

JWT_SECRET=your-super-secret-jwt-key-here // Must be the same key used ACROSS YOUR ENTIRE SYSTEM.

// ============================================
// Email Configuration (for password reset)
// ============================================

SMTP_EMAIL=your-email@example.com
SMTP_EMAIL_PASSWORD=your-email-password
TRANSPORTER_SERVICE=gmail // or your SMTP service
SMTP_HOST=smtp.gmail.com // SMTP server address. This depends on the provider you use.
SMTP_PORT=587            // Port (587 for TLS, 465 for SSL)
SMTP_SECURE=false        // true if using 465 (SSL), false if using 587 (TLS)
SEND_TEST_EMAIL=true // Sends test emails to SMTP_HOST

// ============================================
// SOCIAL AUTH CREDENTIALS
// ============================================

// OAUTH2 - GOOGLE
GOOGLE_CLIENT_ID=your_google_oauth_2.0_client_id // Your Google OAuth 2.0 Client ID
GOOGLE_CLIENT_SECRET=your_google_oauth_2.0_client_secret // Your Google OAuth 2.0 Client Secret

// OAUTH2 - GITHUB
GITHUB_CLIENT_ID=your_github_oauth_2.0_client_id // Your GitHub OAuth 2.0 Client ID
GITHUB_CLIENT_SECRET=your_github_oauth_2.0_client_secret // Your GitHub OAuth 2.0 Client Secret

// OAUTH2 - MICROSOFT
MICROSOFT_CLIENT_ID=your_microsoft_oauth_2.0_client_id // Your Microsoft OAuth 2.0 Client ID
MICROSOFT_CLIENT_SECRET=your_microsoft_oauth_2.0_client_secret // Your Microsoft OAuth 2.0 Client Secret
``` 
## 📋 Environment Variables Reference

| Variable               | Type    | Required | Description                                           | Example                          |
|------------------------|---------|----------|-------------------------------------------------------|----------------------------------|
| **Database Configuration**                                                                                                   |
| `DB_HOST`              | string  | ✅        | Database server hostname or IP address               | `localhost`                     |
| `DB_PORT`              | number  | ✅        | Database server port                                  | `5432`                          |
| `DB_NAME`              | string  | ✅        | Database name                                         | `medical_db`                    |
| `DB_USER`              | string  | ✅        | Database username                                     | `postgres`                      |
| `DB_PASSWORD`          | string  | ✅        | Database password                                     | `1234`                          |
| **Application Configuration**                                                                                               |
| `APP_NAME`             | string  | ❌        | Application name                                      | `Medical API`                   |
| `NODE_ENV`             | string  | ✅        | Environment mode (`development` or `production`)      | `development`                   |
| `PORT`                 | number  | ✅        | Application server port                               | `3000`                          |
| `ROOT_DOMAIN`          | string  | ✅        | Application domain URL                                | `http://localhost:3000`         |
| `FRONTEND_URL`         | string  | ✅        | Frontend URL for OAuth redirects                      | `http://localhost:5173`         |
| `APP_ROLES`            | string  | ✅        | Comma-separated list of system roles                 | `ADMIN,USER,GUEST`              |
| **JWT Configuration**                                                                                                       |
| `JWT_SECRET`           | string  | ✅        | Secret key for JWT signing/verification              | `my-super-secret-key`           |
| **Email Configuration**                                                                                                     |
| `SMTP_EMAIL`           | string  | ✅        | Sender email address                                  | `noreply@app.com`               |
| `SMTP_EMAIL_PASSWORD`  | string  | ✅        | SMTP authentication password                          | `your-password`                 |
| `TRANSPORTER_SERVICE`  | string  | ✅        | Email service provider                                | `gmail`                         |
| `SMTP_HOST`            | string  | ✅        | SMTP server hostname                                  | `smtp.gmail.com`                |
| `SMTP_PORT`            | number  | ✅        | SMTP port (`587` for TLS, `465` for SSL)             | `587`                           |
| `SMTP_SECURE`          | boolean | ✅        | Use SSL (`true` for `465`, `false` for `587`)        | `false`                         |
| `SEND_TEST_EMAIL`      | boolean | ❌        | Send test emails on startup                           | `true`                          |
| **OAuth2 - Google**                                                                                                         |
| `GOOGLE_CLIENT_ID`     | string  | ⚠️        | Google OAuth 2.0 Client ID                            | `123456-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | string  | ⚠️        | Google OAuth 2.0 Client Secret                        | `GOCSPX-abc123`                 |
| **OAuth2 - GitHub**                                                                                                         |
| `GITHUB_CLIENT_ID`     | string  | ⚠️        | GitHub OAuth 2.0 Client ID                            | `Iv1.a1b2c3d4e5f6g7h8`          |
| `GITHUB_CLIENT_SECRET` | string  | ⚠️        | GitHub OAuth 2.0 Client Secret                        | `abc123def456`                  |
| **OAuth2 - Microsoft**                                                                                                      |
| `MICROSOFT_CLIENT_ID`  | string  | ⚠️        | Microsoft OAuth 2.0 Client ID                         | `12345678-1234-1234-1234-123456789abc` |
| `MICROSOFT_CLIENT_SECRET` | string | ⚠️      | Microsoft OAuth 2.0 Client Secret                     | `abc~123-secret`                |

### Legend:
- ✅ Required
- ❌ Optional
- ⚠️ Required only if using OAuth provider

---

### 🔒 Security Notes
- **`JWT_SECRET`**: Must be the same across all APIs consuming tokens. Keep it secure and never commit to version control.
- **OAuth Credentials**: Rotate periodically and store securely. Never expose publicly.
- **`NODE_ENV`**: In production, ensure `NODE_ENV=production` for proper security settings (HTTPS, secure cookies).
- **SMTP Password**: Use app-specific passwords when available (e.g., Gmail App Passwords).
---

**Note**: Ensure this file is not uploaded to public repositories to avoid compromising credentials and application security.
---

# 🔐 Authentication API Endpoints

## 📋 Quick Overview
| Endpoint | Method | Description | 
|----------|---------|-------------|
| `/auth/register` | POST | Create new user |
| `/auth/login` | POST | User login |
| `/auth/logout` | GET | User logout |
| `/auth/forgot-password` | POST | Password reset request |
| `/auth/reset-password/:token` | POST | Complete password reset |
## 🌐 OAuth Authentication Endpoints

| Endpoint                          | Method | Description                          |
|-----------------------------------|--------|--------------------------------------|
| `/auth/google`                    | GET    | Initiate Google OAuth login          |
| `/auth/google/callback`           | GET    | Handle Google OAuth callback         |
| `/auth/github`                    | GET    | Initiate GitHub OAuth login          |
| `/auth/github/callback`           | GET    | Handle GitHub OAuth callback         |
| `/auth/microsoft`                 | GET    | Initiate Microsoft OAuth login       |
| `/auth/microsoft/callback`        | GET    | Handle Microsoft OAuth callback      |
| `/auth/profile`                   | GET    | Get authenticated user profile       |

---

### `POST` `/auth/register`
🚀 Register New User
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "name": "Optional Name"
}
  ```
**Responses:**
- ✅ 201 Created - User registered successfully, secure HTTP-only cookie set
```json
  {
    "message": "User created successfully",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
  ```
- ❌ `400 Bad Request`: If validation fails (e.g., invalid email, password mismatch, etc.).
- ❌ `401 Unauthorized`: If the email is already registered.
---

### `POST` `/auth/login`
🚪 Login
```json
{
  "email": "user@example.com", 
  "password": "password123"
}
```
**Headers**: Sets HTTP-only cookie `access_token` with JWT token
  - **Cookie Details**:
    - `httpOnly: true` - Prevents JavaScript access
    - `secure: true` (in production) - HTTPS only
    - `sameSite: 'strict'` - CSRF protection
    - `maxAge: 3600000` (1 hour) - Token expiration

**Responses:**

- ✅ 200 OK - Sets secure HTTP-only cookie with JWT token
```json 
{
    "message": "Login successful",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
  ```
- ❌ 400 Bad Request - Validation error
- ❌ 401 Unauthorized - Invalid credentials

### **JWT Token Details**
- **Algorithm**: HS256
- **Payload**:
  ```json
  {
    "id": "user_uuid",
    "email": "user@example.com",
    "iat": 1639588800,
    "exp": 1639592400
  }
  ```
- **Expiration**: 1 hour from issue time
- **Usage**: Include in subsequent requests via cookie (automatically handled by browser)
---

## `GET` `/auth/logout`
### 🚪 Logout

**Responses:**
- ✅ `200 OK` - Clears authentication cookie
- No body required

---

## `POST` `/auth/forgot-password`
### 📧 Password Reset Request  

```json
{
  "email": "user@example.com"
}
```
 **Responses**:
  - ✅ `200 OK`: Email sent with reset instructions.
  - ❌ `400 Bad Request`: If validation fails.
  - ❌ `401 Unauthorized`: If the email is not registered.
---
## `POST` `/auth/reset-password/:token`
### 🔑 Complete Password Reset

- Resets the user's password using a token.
- **Request Parameters**:
- `token` (string, required): Token received in the reset email.

   ```json
  {
    "password": "min_6_max_50_characters",
    "confirmPassword": "must_match_password"
  }
- **Responses**:
  - ✅ `200 OK`: Password changed successfully.
  - ❌ `400 Bad Request`: If validation fails.
  - ❌ `401 Unauthorized`: If the token is invalid or expired.

## 🌐 OAuth Endpoints

### `/auth/{provider}`
- **Description**: Redirects the user to the OAuth provider's authentication page (Google, GitHub, or Microsoft) to initiate the login process.
- **Method**: `GET`
- **Usage**: Replace `{provider}` with the desired OAuth provider (`google`, `github`, or `microsoft`).

### `GET` `/auth/{provider}/callback`
- **Description**: Handles the response from the OAuth provider after the user authenticates. Generates a JWT, stores it in a secure cookie, and redirects the user to the frontend with the token.
- **Method**: `GET`
- **Usage**: Replace `{provider}` with the desired OAuth provider (`google`, `github`, or `microsoft`).

---

## 👤 Profile Endpoint

### `GET` `/auth/profile`
- **Description**: Retrieves the authenticated user's information using the JWT stored in cookies. Returns user data excluding sensitive fields like password and reset tokens.
- **Method**: `GET`
- **Authentication**: Requires a valid JWT in the HTTP-only cookie.
- **Response Example**:
  ```json
  {
    "id": "user_uuid",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["USER"]
  }
  ```

# Tests

This project uses **Jest** as the testing framework to ensure functionality across modules and routes and **Supertest** for HTTP assertions on API endpoints. Follow these steps to execute the tests:

## Running Tests
You can run all tests in the project using the following command:

```bash
npm test
pnpm test or
yarn test
```