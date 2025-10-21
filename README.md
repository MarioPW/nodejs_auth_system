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

DATABASE_URL=postgresql://username:password@localhost:5432/auth_system_db
// All roles in a single variable separated by commas
APP_ROLES=ADMIN,GUEST,MODERATOR or any role you need in your system. // Default role: USER; this will be assigned to new users or if no role is provided.

// ============================================
// Application Configuration
// ============================================

APP_NAME=your_app_name // Application name (Optional)
NODE_ENV=development  // 
PORT=3000
ROOT_DOMAIN=http://localhost:3000
FRONTEND_URL=www.frontend_url.com/  // The user will be redirected to this URL after authenticating with social_auth.

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
### `JWT_SECRET`
- **Description**: Secret key used to sign and verify JSON Web Tokens (JWT).
- **Type**: `string`
- **Example**: `WsAPow3rv1w-secure-8Hm1pB3qRrAhi55sdj`
- **Impance**: This key should be secure and random, as it ensures the integrity and security of the authentication system. Do not share this value publicly.

### `NODE_ENV`
- **Description**: Defines the environment in which the application runs.
- **Type**: `strin- **Allowed Values**:
  - `development`: for the development environment.
  - `production`: for the production environment.
- **Example**: `development`
- **Importance**: Enables the application to adjust its configuration and behavior according to the environment.

### `SMTP_EMAIL`
- **Description**: Primary email address used as the sender for notifications or password recovery.
- **Type**: `string`
- **Example**: `app_mannager@email.com`
- **Note**: This account must be correctly configured to send emails through the service used.

### `SMTP_EMAIL_PASSWORD`
- **Description**: Password for the primary email account used to authenticate with the email server.
- **Type**: `string`
- **Example**: `smtp service password`
- **Importance**: This password is sensitive and should be protected to avoid unauthorized access.


### `ROOT_DOMAIN`
- **Description**: Specifies the domain from which the application runs, useful for building absolute URLs within the system.
- **Type**: `string`
- **Example**: `http://localhost:3000` or `https://api.myapp.com`
- **Importance**: Defines the domain for HTTP-only cookies and CORS configuration.

---

### `JWT_SECRET`
- **Description**: Secret key used to sign and verify JSON Web Tokens (JWT).
- **Type**: `string`
- **Example**: `my-super-secure-password`
- **⚠️ Importance**: **Must be the same across all systems consuming the token. This key should be unique and secure.**
- **Critical**: Share only between the authentication backend and APIs verifying tokens.

---

### `NODE_ENV`
- **Description**: Defines the environment in which the application runs.
- **Type**: `string`
- **Allowed Values**: 
  - `development`: For development environment.
  - `production`: For production environment.
- **Example**: `development`
- **Importance**: Determines security configurations (e.g., HTTPS, cookies).
- **Security**: In production, set `secure: true` for cookies.

---

### `FRONTEND_URL`
- **Description**: URL of the frontend for post-authentication redirections.
- **Type**: `string`
- **Example**: `https://my-app.com` or `http://localhost:5173`
- **Importance**: Must match the allowed origin in CORS configuration.
- **Flow**: The user is redirected here after a successful login.

---
### `APP_ROLES`
- **Description**: Roles available in the system, separated by commas.
- **Type**: `string`
- **Example**: `ADMIN,USER,MODERATOR,GUEST`
- **Importance**: Must include all roles used across the system.
- **Roles**: Coordinate between frontend, backend, and business logic.

---

### `SMTP_EMAIL`
- **Description**: Primary email address used for notifications and password recovery.
- **Type**: `string`
- **Example**: `app_manager@email.com`
- **Note**: This account must be configured to send emails.

---

### `SMTP_EMAIL_PASSWORD`
- **Description**: Password for authenticating with the SMTP server.
- **Type**: `string`
- **Example**: `smtp-service-password`
- **Importance**: Sensitive data that must be protected from unauthorized access.

---

### 📋 Checklist
- `JWT_SECRET` is identical across all systems.
- `FRONTEND_URL` matches the allowed origin in CORS.

- `APP_ROLES` includes all necessary roles.
- `NODE_ENV` is correctly configured for security.
---
## 🔐 Environment Variables - OAuth2 Authentication

### `{PROVIDER}_CLIENT_ID`
- **Description**: Client ID of the application registered with the OAuth provider (e.g., Google, GitHub, Microsoft, or Facebook).
- **Type**: `string`
- **Example**: `12345678-1234-1234-1234-123456789abc`
- **Importance**: Identifies your application to the OAuth provider.
- **Configuration**: Obtain this value by registering your application in the respective provider's developer console.

---

### `{PROVIDER}_CLIENT_SECRET`
- **Description**: Client Secret of the application registered with the OAuth provider.
- **Type**: `string`
- **Example**: `abc123~-secret-key-here`
- **Importance**: Sensitive key that authenticates your backend with the OAuth provider.
- **Security**: Rotate periodically and never expose publicly. Store securely in environment variables.
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