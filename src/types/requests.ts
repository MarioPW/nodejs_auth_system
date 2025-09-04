import { Request } from 'express';
// Interfaces para los requests
export interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    name?: string;
  }
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  }
}

export interface ForgotPasswordRequest extends Request {
  body: {
    email: string;
  }
}

export interface ResetPasswordRequest extends Request {
  params: {
    token: string;
  };
  body: {
    password: string;
    confirmPassword: string;
  }
}
