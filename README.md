# Auth System with NodeJS + TypeScript

## Overview
This project is a RESTful API built with Express.js and TypeScript, using Sequelize for ORM and Jest for testing. It includes various authentication and user management endpoints, including a password reset functionality.

## Prerequisites
Make sure you have the following tools and libraries installed:
- **Node.js** (v16+ recommended) 
- **npm** or **yarn**
- **PostgreSQL** (database)

## Dependencies
The following packages are used in this project:

### Runtime Dependencies:
- **Express.js**: Framework for building the REST API
- **Sequelize**: ORM for database management
- **Bcrypt**: For hashing and comparing passwords
- **jsonwebtoken (JWT)**: Used to manage user authentication tokens
- **Nodemailer**: Handles sending emails (e.g., password reset emails)
- **Zod**: For schema validations
- **dotenv**: For environment variable management
- **pg**: PostgreSQL client
- **cookie-parser**: For cookie handling
- **cors**: For Cross-Origin Resource Sharing

### Development Dependencies:
- **TypeScript**: TypeScript language support
- **ts-node**: TypeScript execution for Node.js
- **@types/node**: TypeScript definitions for Node.js
- **@types/express**: TypeScript definitions for Express
- **@types/bcrypt**: TypeScript definitions for bcrypt
- **@types/jsonwebtoken**: TypeScript definitions for JWT
- **@types/nodemailer**: TypeScript definitions for nodemailer
- **@types/pg**: TypeScript definitions for PostgreSQL
- **@types/cors**: TypeScript definitions for CORS
- **@types/cookie-parser**: TypeScript definitions for cookie-parser
- **@types/jest**: TypeScript definitions for Jest
- **jest**: Testing framework
- **supertest**: Library for testing HTTP endpoints
- **nodemon**: For automatic server restarts during development


# Environment Configuration File

This `.env` file contains the necessary configurations and secrets for the application. Ensure this file remains secure and is not shared publicly.

## Environment Variables
``` js
// Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/auth_system_db

// JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

// Application Configuration
NODE_ENV=development
PORT=3000
ROOT_DOMAIN=http://localhost:3000

// Email Configuration (for password reset)
SMTP_EMAIL=your-email@example.com
SMTP_EMAIL_PASSWORD=your-email-password
TRANSPORTER_SERVICE=gmail // or your SMTP service
SMTP_HOST=smtp.gmail.com // SMTP server address. This depends on the provider you use.
SMTP_PORT=587                 // Port (587 for TLS, 465 for SSL)
SMTP_SECURE=false            // true if using 465 (SSL), false if using 587 (TLS)
SEND_TEST_EMAIL=true // 

// All roles in a single variable separated by commas
APP_ROLES=ADMIN,USER,GUEST or any role you need in your system.
``` 
### `JWT_SECRET`
- **Description**: Secret key used to sign and verify JSON Web Tokens (JWT).
- **Type**: `string`
- **Example**: `WsAPow3rv1w-secure-8Hm1pB3qRrAhi55sdj`
- **Importance**: This key should be secure and random, as it ensures the integrity and security of the authentication system. Do not share this value publicly.

### `NODE_ENV`
- **Description**: Defines the environment in which the application runs.
- **Type**: `string`
- **Allowed Values**:
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
- **Description**: Root domain of the application.
- **Type**: `string`
- **Example**: `http://localhost:3000` or `https://www.mywebsite.com`
- **Importance**: Specifies the domain from which the application runs, useful for building absolute URLs within the system.

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

---

## `POST` `/auth/register`
### 🚀 Register New User

```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "name": "Optional Name"
}
  ```
**Responses:**
- ✅ `201 Created`: Returns the created user.
- ❌ `400 Bad Request`: If validation fails (e.g., invalid email, password mismatch, etc.).
- ❌ `401 Unauthorized`: If the email is already registered.
---

## `POST` `/auth/login`
### 🚪 Login
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
  - **Body**: Returns the same JWT token as string

**Responses:**

- ✅ 200 OK - Sets secure HTTP-only cookie with JWT token
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

# Tests

This project uses **Jest** as the testing framework to ensure functionality across modules and routes and **Supertest** for HTTP assertions on API endpoints. Follow these steps to execute the tests:


## Running Tests
You can run all tests in the project using the following command:

```bash
npm test
```