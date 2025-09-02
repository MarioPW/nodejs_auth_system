// authRouter.test.js
import request from 'supertest';
import app from '../src/app.js';

import { User } from '../src/Auth/models.js';
import { jest, test } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MailManager } from '../src/Utils/mailManager.js';
import { emailSchema } from '../src/Auth/schemas.js';


//------- Mocks --------------
User.findOne = jest.fn();
User.create = jest.fn();

MailManager.sendMail = jest.fn();

emailSchema.safeParse = jest.fn();

bcrypt.compare = jest.fn();


describe('Authentication API Endpoints', () => {
    beforeAll(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('POST /auth/register', () => {
        test('should register a new user successfully', async () => {
            const newUser = { email: 'test@example.com', password: 'password123', confirmPassword: 'password123', name: 'Test User' };
            User.findOne.mockResolvedValue(null)
            User.create.mockResolvedValue({ ...newUser, id: 1 });

            const res = await request(app).post('/auth/register').send(newUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.email).toBe(newUser.email);
            expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
                email: newUser.email,
                password: expect.any(String),
            }));
        });

        test('should return an error if email already exists', async () => {
            const existingUser = { email: 'test@example.com', password: 'password123', confirmPassword: 'password123', name: 'Test User' };

            User.findOne.mockResolvedValue(existingUser);

            const res = await request(app).post('/auth/register').send(existingUser);

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('User already exists');
        });

        test('should return an error if User.create fails', async () => {
            const newUser = { email: 'test@example.com', password: 'password123', confirmPassword: 'password123', name: 'Test User' };
            User.findOne.mockResolvedValue(null);
            User.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            const res = await request(app).post('/auth/register').send(newUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('POST /auth/login', () => {
        test('should login successfully and return a token', async () => {
            const user = { id: 1, email: 'test@example.com', password: 'hashedPassword', role: 'USER' };

            User.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app).post('/auth/login').send({
                email: user.email,
                password: 'password123',
            });

            expect(res.statusCode).toBe(200);
            expect(res.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('access_token'),
                ])
            );

            const token = res.body;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded).toHaveProperty('id', user.id);
        });

        test('should return an error if credentials are incorrect', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app).post('/auth/login').send({
                email: 'wrong@example.com',
                password: 'password123',
            });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });
    });

    // describe('POST /auth/forgot-password', () => {
    //     test('should return 401 if user is not found', async () => {
    //         User.findOne.mockResolvedValue(null);

    //         const email = 'nonexistent@example.com';
    //         const res = await request(app).post('/auth/forgot-password').send({ email });

    //         expect(res.statusCode).toBe(401);
    //         expect(res.body.error).toBe('Invalid credentials');
    //         expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
    //     });

    // test('should send reset password email successfully if user is found', async () => {
    //     const email = 'test@example.com';
    //     const user = { id: 1, email, save: jest.fn() };
    //     const token = 'mock-token';

    //     User.findOne.mockResolvedValue(user);
    //     jest.spyOn(crypto, 'randomUUID').mockReturnValue(token);
    //     MailManager.sendMail.mockResolvedValue();

    //     const res = await request(app).post('/auth/forgot-password').send({ email });

    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.message).toBe('Email sent successfully');
    //     expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
    //     expect(MailManager.sendMail).toHaveBeenCalledWith({
    //         to: email,
    //         text: "This email is to reset your password. If you haven't requested it, ignore this email.",
    //         subject: 'Reset password',
    //         html: `<strong>it works!</strong><br>Click <a href='${process.env.ROOT_DOMAIN}/auth/reset-password-form/${token}'>here</a> to reset your password`,
    //     });
    //     expect(user.save).toHaveBeenCalled();
    // });

    // test('should return 401 if user is not found', async () => {
    //     const email = 'nonexistent@example.com';
    //     emailSchema.safeParse.mockReturnValue({ success: true, data: email });

    //     User.findOne.mockResolvedValue(null);

    //     // Realiza la solicitud POST
    //     const res = await request(app)
    //         .post('/auth/forgot-password')
    //         .send({ email });  // Verifica que email se envíe aquí correctamente


    //     // Verificaciones
    //     expect(res.statusCode).toBe(401);
    //     expect(res.body).toEqual({ error: 'Invalid credentials' });
    //     expect(User.findOne).toHaveBeenCalledWith({ where: { email: email } });
    //     expect(MailManager.sendMail).not.toHaveBeenCalled();
    // });

    test('should return 400 if email is invalid', async () => {
        const email = 'invalid-email';
        emailSchema.safeParse.mockReturnValue({});

        const res = await request(app).post('/auth/forgot-password').send({ email });

        // Afirmaciones
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid credentials');
        expect(User.findOne).not.toHaveBeenCalled();
        expect(MailManager.sendMail).not.toHaveBeenCalled();
    });
});

// describe('GET /auth/reset-password-form/:token', () => {
//     test('should return reset password form', async () => {
//         const res = await request(app).get('/auth/reset-password-form/some-valid-token');
//         expect(res.statusCode).toBe(200);
//     });
// });

// describe('POST /auth/reset-password/:token', () => {
//     test('should reset password with valid token', async () => {
//         const user = { id: 1, email: 'test@example.com', resetPasswordToken: 'valid-token' };
//         User.findOne.mockResolvedValue(user);

//         const res = await request(app)
//             .post('/auth/reset-password/valid-token')
//             .send({ password: 'newPassword123', confirmPassword: 'newPassword123' });

//         expect(res.statusCode).toBe(200);
//         expect(res.body.message).toBe('Password changed successfully');
//     });

//     test('should return error if token is invalid', async () => {
//         User.findOne.mockResolvedValue(null);

//         const res = await request(app)
//             .post('/auth/reset-password/invalid-token')
//             .send({ password: 'newPassword123', confirmPassword: 'newPassword123' });

//         expect(res.statusCode).toBe(401);
//         expect(res.body.error).toBe('Invalid credentials');
//     });
// });

// describe('GET /auth/logout', () => {
//     test('should clear the access token cookie', async () => {
//         const res = await request(app).get('/auth/logout');
//         expect(res.statusCode).toBe(200);
//         expect(res.headers['set-cookie'][0]).toMatch(/access_token=;/);
//     });
// });
// });
