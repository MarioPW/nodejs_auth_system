// tests/authRouter.test.ts
import request from 'supertest';
import { jest, test, describe, beforeAll, expect, beforeEach } from '@jest/globals';

// IMPORTANTE: Mockear ANTES de importar app

jest.mock('../src/Utils/mailManager', () => ({
    MailManager: {
        sendMail: jest.fn(() => Promise.resolve({
            messageId: 'test-message-id-123',
            envelope: { from: 'test@test.com', to: [] },
            accepted: [],
            rejected: [],
            pending: [],
            response: '250 OK'
        }))
    }
}));

jest.mock('../src/Auth/models');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/Auth/schemas', () => ({
    emailSchema: {
        safeParse: jest.fn()
    },
    signupSchema: {
        safeParse: jest.fn()
    },
    loginSchema: {
        safeParse: jest.fn()
    },
    resetPasswordSchema: {
        safeParse: jest.fn()
    }
}));
jest.mock('crypto', () => ({
    randomUUID: jest.fn(() => 'mock-token-123'),
    createHash: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn(() => 'mock-hash')
    })),
    createHmac: jest.fn(),
    randomBytes: jest.fn(() => Buffer.from('mock-bytes')),
    pseudoRandomBytes: jest.fn(),
    getCiphers: jest.fn(),
}));

// Importar DESPUÉS de los mocks
import app from '../src/app';
import { User } from '../src/Auth/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MailManager } from '../src/Utils/mailManager';
import { emailSchema, signupSchema, loginSchema, resetPasswordSchema } from '../src/Auth/schemas';
import crypto from 'crypto';

const mockedUser = User as jest.Mocked<typeof User>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedMailManager = MailManager as jest.Mocked<typeof MailManager>;
const mockedEmailSchema = emailSchema as jest.Mocked<typeof emailSchema>;
const mockedSignupSchema = signupSchema as jest.Mocked<typeof signupSchema>;
const mockedLoginSchema = loginSchema as jest.Mocked<typeof loginSchema>;
const mockedResetPasswordSchema = resetPasswordSchema as jest.Mocked<typeof resetPasswordSchema>;

describe('Authentication API Endpoints', () => {
    beforeAll(() => {
        // Agregar variables de entorno para tests
        process.env.JWT_SECRET = 'test-secret';
        process.env.ROOT_DOMAIN = 'http://localhost:3000';
        process.env.EMAIL_HOST = 'smtp.test.com';
        process.env.EMAIL_PORT = '587';
        process.env.EMAIL_USER = 'test@test.com';
        process.env.EMAIL_PASS = 'testpassword';
        process.env.EMAIL_SECURE = 'false';
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Configurar mocks por defecto
        mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
        mockedBcrypt.compare.mockResolvedValue(true as never);
        mockedJwt.sign.mockReturnValue('mock-jwt-token' as never);
    });

    describe('POST /auth/register', () => {
        test('should register a new user successfully', async () => {
            const newUser = { 
                email: 'test@example.com', 
                password: 'password123', 
                name: 'Test User' 
            };
            
            mockedSignupSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: newUser 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(null);
            mockedUser.create.mockResolvedValue({ 
                ...newUser, 
                id: '1',
                role: 'USER',
                active: false,
                authenticated: false,
                resetPasswordToken: null,
                createdAt: new Date(),
                updatedAt: new Date()
            } as any);

            const res = await request(app).post('/auth/register').send(newUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.email).toBe(newUser.email);
            expect(mockedUser.create).toHaveBeenCalledWith(expect.objectContaining({
                email: newUser.email,
                password: 'hashedPassword',
            }));
        });

        test('should return an error if email already exists', async () => {
            const existingUser = { 
                email: 'test@example.com', 
                password: 'password123', 
                name: 'Test User' 
            };

            mockedSignupSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: existingUser 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(existingUser as any);

            const res = await request(app).post('/auth/register').send(existingUser);

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('User already exists');
        });

        test('should return an error if User.create fails', async () => {
            const newUser = { 
                email: 'test@example.com', 
                password: 'password123', 
                name: 'Test User' 
            };
            
            mockedSignupSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: newUser 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(null);
            mockedUser.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            const res = await request(app).post('/auth/register').send(newUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Database error');
        });

        test('should return error if validation fails', async () => {
            const invalidUser = { 
                email: 'invalid-email', 
                password: 'short' 
            };

            mockedSignupSchema.safeParse.mockReturnValue({ 
                success: false, 
                error: { message: 'Validation failed' } 
            } as any);

            const res = await request(app).post('/auth/register').send(invalidUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Validation failed');
        });
    });

    describe('POST /auth/login', () => {
        test('should login successfully and return a token', async () => {
            const user = { 
                id: '1', 
                email: 'test@example.com', 
                password: 'hashedPassword', 
                role: 'USER' 
            };

            mockedLoginSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: { email: user.email, password: 'password123' } 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(user as any);

            const res = await request(app).post('/auth/login').send({
                email: user.email,
                password: 'password123',
            });

            expect(res.statusCode).toBe(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.text).toBe('"\mock-jwt-token\"');
        });

        test('should return an error if credentials are incorrect', async () => {
            mockedLoginSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: { email: 'wrong@example.com', password: 'password123' } 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(null);

            const res = await request(app).post('/auth/login').send({
                email: 'wrong@example.com',
                password: 'password123',
            });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });

        test('should return error if password is incorrect', async () => {
            const user = { 
                id: '1', 
                email: 'test@example.com', 
                password: 'hashedPassword', 
                role: 'USER' 
            };

            mockedLoginSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: { email: user.email, password: 'wrongpassword' } 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(user as any);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            const res = await request(app).post('/auth/login').send({
                email: user.email,
                password: 'wrongpassword',
            });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });

        test('should return error if validation fails', async () => {
            mockedLoginSchema.safeParse.mockReturnValue({ 
                success: false, 
                error: { message: 'Validation failed' } 
            } as any);

            const res = await request(app).post('/auth/login').send({
                email: 'invalid-email',
                password: 'short',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Validation failed');
        });
    });

    describe('POST /auth/forgot-password', () => {
        test('should return 401 if user is not found', async () => {
            const email = 'nonexistent@example.com';
            
            mockedEmailSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: { email } 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/auth/forgot-password')
                .send({ email });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('User not found');
            expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email } });
        });

        test('should return 400 if email validation fails', async () => {
            const email = 'invalid-email';
            
            mockedEmailSchema.safeParse.mockReturnValue({ 
                success: false, 
                error: { message: 'Invalid email' } 
            } as any);

            const res = await request(app)
                .post('/auth/forgot-password')
                .send({ email });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Invalid email');
            expect(mockedUser.findOne).not.toHaveBeenCalled();
        });

        test('should send reset password email successfully', async () => {
            const email = 'test@example.com';
            const token = 'mock-token-123';
            
            const user = {
                id: '1',
                email,
                resetPasswordToken: null,
                save: jest.fn().mockResolvedValue(undefined as never)
            } as any;

            mockedEmailSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: { email } 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(user);

            const res = await request(app)
                .post('/auth/forgot-password')
                .send({ email });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Email sent successfully');
            expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email } });
            expect(mockedMailManager.sendMail).toHaveBeenCalledWith({
                to: email,
                text: "This email is to reset your password. If you haven't requested it, ignore this email.",
                subject: 'Reset password',
                html: `<strong>it works!</strong><br>Click <a href='http://localhost:3000/auth/reset-password-form/${token}'>here</a> to reset your password`,
            });
            expect(user.save).toHaveBeenCalled();
        });
    });

    describe('GET /auth/logout', () => {
        test('should clear the access token cookie', async () => {
            const res = await request(app).get('/auth/logout');
            
            expect(res.statusCode).toBe(200);
            expect(res.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('access_token=;'),
                ])
            );
        });
    });

    describe('GET /auth/reset-password-form/:token', () => {
        test('should return 404 if reset password form file does not exist', async () => {
            // Mock de path.join para simular que el archivo no existe
            jest.spyOn(require('path'), 'join').mockReturnValue('/non/existent/path');
            
            const res = await request(app).get('/auth/reset-password-form/some-token');
            
            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /auth/reset-password/:token', () => {
        test('should reset password successfully', async () => {
            const token = 'valid-token';
            const newPassword = 'newPassword123';
            
            const user = {
                id: '1',
                password: 'oldHashedPassword',
                resetPasswordToken: token,
                save: jest.fn().mockResolvedValue(undefined as never)
            } as any;

            mockedResetPasswordSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: { password: newPassword, confirmPassword: newPassword } 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(user);

            const res = await request(app)
                .post(`/auth/reset-password/${token}`)
                .send({ password: newPassword, confirmPassword: newPassword });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Password changed successfully');
            expect(user.save).toHaveBeenCalled();
        });

        test('should return error for invalid token', async () => {
            const token = 'invalid-token';
            
            mockedResetPasswordSchema.safeParse.mockReturnValue({ 
                success: true, 
                data: { password: 'newPassword123', confirmPassword: 'newPassword123' } 
            } as any);
            
            mockedUser.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post(`/auth/reset-password/${token}`)
                .send({ password: 'newPassword123', confirmPassword: 'newPassword123' });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('Invalid token');
        });

        test('should return error if validation fails', async () => {
            const token = 'valid-token';
            
            mockedResetPasswordSchema.safeParse.mockReturnValue({ 
                success: false, 
                error: { message: 'Passwords do not match' } 
            } as any);

            const res = await request(app)
                .post(`/auth/reset-password/${token}`)
                .send({ password: 'newPassword123', confirmPassword: 'differentPassword' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Passwords do not match');
        });
    });
});