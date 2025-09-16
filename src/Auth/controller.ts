import { Router, Request, Response } from 'express';
import { User } from './models';
import { UserInstance } from '../types/modelTypes';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';
import { RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/requests';
import { signupSchema, loginSchema, emailSchema, resetPasswordSchema } from './schemas';
import { MailManager } from '../Utils/mailManager';

export const authRouter = Router();

authRouter.post('/register', async (req: RegisterRequest, res: Response) => {
    const reqBody = req.body;
    const validation = signupSchema.safeParse(reqBody);

    if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
    }

    const { email, password, name } = validation.data;

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(401).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            name: name || email,
            password: hashedPassword,
            role: 'USER' // Add the required role field
        });

        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.post('/login', async (req: LoginRequest, res: Response) => {
    const reqBody = req.body;
    const validation = loginSchema.safeParse(reqBody);

    if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
    }

    try {
        const user = await User.findOne({ where: { email: validation.data.email } }) as UserInstance | null;
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const checkPassword = await bcrypt.compare(validation.data.password, user.password);
        if (!checkPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        }).json(token);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.get('/logout', (req: Request, res: Response) => {
    res.clearCookie('access_token').send();
});

authRouter.post('/forgot-password', async (req: ForgotPasswordRequest, res: Response) => {
    const { email } = req.body;
    const validation = emailSchema.safeParse({ email });

    if (!validation.success) {
        return res.status(400).json({ error: "Invalid email" });
    }

    try {
        const user = await User.findOne({ where: { email: validation.data.email } }) as UserInstance | null;
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const token = crypto.randomUUID();

        const emailTemplate = {
            to: user.email,
            text: "This email is to reset your password. If you haven't requested it, ignore this email.",
            subject: "Reset password",
            html: `<strong>it works!</strong><br>Click <a href='${process.env.ROOT_DOMAIN}/auth/reset-password-form/${token}'>here</a> to reset your password`,
        };

        await MailManager.sendMail(emailTemplate);

        user.resetPasswordToken = token;
        await user.save();

        res.status(200).json({ message: "Email sent successfully"});
    } catch (error: any) {
        res.status(400).json({ error: error.message + " - " + error.stack } );
    }
});

authRouter.get('/reset-password-form/:token', async (req: Request<{ token: string }>, res: Response) => {
    const { token } = req.params;
    const filePath = path.join(process.cwd(), 'src', 'public', 'resetPasswordForm.html');
    res.sendFile(filePath);
});

authRouter.post('/reset-password/:token', async (req: ResetPasswordRequest, res: Response) => {
    const { token } = req.params;
    const passwords = req.body;
    const validation = resetPasswordSchema.safeParse(passwords);

    if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
    }

    try {
        const user = await User.findOne({ where: { resetPasswordToken: token } }) as UserInstance | null;
        if (!user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const hashedPassword = await bcrypt.hash(validation.data.password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});