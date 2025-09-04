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
MAIN_EMAIL=your-email@example.com
MAIN_EMAIL_PASSWORD=your-email-password
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

### `MAIN_EMAIL`
- **Description**: Primary email address used as the sender for notifications or password recovery.
- **Type**: `string`
- **Example**: `app_mannager@email.com`
- **Note**: This account must be correctly configured to send emails through the service used.

### `MAIN_EMAIL_PASSWORD`
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



# Endpoints

### 1. Login User

- **URL**: `/login`
- **Method**: `POST`
- **Description**: Authenticates a user and provides a session token.
- **Request Body**:

  ```json
  {
    "email": "must_be_valid_email_format",
    "password": "min_6_max_50_characters"
  }

---


### 2. Register a New User

- **URL**: `/register`
- **Method**: `POST`
- **Description**: Registers a new user with email, password, and optional name.
- **Request Body**:
  ```json
  {
    "email": "must_be_valid_email_format",
    "password": "min_6_max_50_characters",
    "confirmPassword": "must_match_password",
    "name": "Optional_min_3_max_25_characters"
  }
- **Responses**:
  - `201 Created`: Returns the created user.
  - `400 Bad Request`: If validation fails (e.g., invalid email, password mismatch, etc.).
  - `401 Unauthorized`: If the email is already registered.
---

### 3. User Login

- **URL**: `/login`
- **Method**: `POST`
- **Description**: Authenticates the user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "must_be_valid_email_format",
    "password": "min_6_max_50_characters",
    "name": "Optional_min_3_max_25_characters"
  }
- **Responses**:
  - `200 OK`: Sets a JWT token in an `access_token` cookie with HTTP-only, secure attributes.
  - `400 Bad Request`: If validation fails.
  - `401 Unauthorized`: If credentials are invalid.

---

### 4. Logout

- **URL**: `/logout`
- **Method**: `GET`
- **Description**: Clears the JWT token cookie.
- **Response**:
  - `200 OK`: Cookie `access_token` cleared.

---

### 5. Forgot Password

- **URL**: `/forgot-password`
- **Method**: `POST`
- **Description**: Sends a reset password email to the user.
- **Request Body**:
  ```json
  {
    "email": "must_be_valid_email_format",
  }
- **Responses**:
  - `200 OK`: Email sent with reset instructions.
  - `400 Bad Request`: If validation fails.
  - `401 Unauthorized`: If the email is not registered.

---

### 6. Reset Password

- **URL**: `/reset-password/:token`
- **Method**: `POST`
- **Description**: Resets the user's password using a token.
- **Request Parameters**:
  - `token` (string, required): Token received in the reset email.
- **Request Body**:
   ```json
  {
    "password": "min_6_max_50_characters",
    "confirmPassword": "must_match_password"
  }
- **Responses**:
  - `200 OK`: Password changed successfully.
  - `400 Bad Request`: If validation fails.
  - `401 Unauthorized`: If the token is invalid or expired.

# Tests

This project uses **Jest** as the testing framework to ensure functionality across modules and routes and **Supertest** for HTTP assertions on API endpoints. Follow these steps to execute the tests:


## Running Tests
You can run all tests in the project using the following command:

```bash
npm test
```