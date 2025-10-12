import { Router, Request, Response, NextFunction } from 'express';
import { User } from './models';
import { UserInstance } from '../types/modelTypes';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';
import passport from '../config/passport.config';
import { RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/requests';
import { signupSchema, loginSchema, emailSchema, resetPasswordSchema } from './schemas';
import { MailManager } from '../Utils/mailManager';

export const authRouter: Router = Router();

// ============================================
// HELPERS
// ============================================

const generateToken = (user: UserInstance): string => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );
};

const setTokenCookie = (res: Response, token: string): void => {
    res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
    });
};

// ============================================
// TRADITIONAL AUTH (Email/Password)
// ============================================

authRouter.post('/register', async (req: RegisterRequest, res: Response) => {
    const validation = signupSchema.safeParse(req.body);

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
            role: 'USER',
            primaryProvider: 'local'
        });

        const token = generateToken(newUser);
        setTokenCookie(res, token);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            },
            token
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.post('/login', async (req: LoginRequest, res: Response) => {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
    }

    try {
        const user = await User.findOne({ 
            where: { email: validation.data.email } 
        }) as UserInstance | null;

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user registered with OAuth and has no password
        if (!user.password) {
            return res.status(401).json({ 
                error: `This account uses ${user.primaryProvider} login. Please use the appropriate login method.`,
                provider: user.primaryProvider
            });
        }

        const checkPassword = await bcrypt.compare(validation.data.password, user.password);
        if (!checkPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        setTokenCookie(res, token);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.post('/forgot-password', async (req: ForgotPasswordRequest, res: Response) => {
    const validation = emailSchema.safeParse({ email: req.body.email });

    if (!validation.success) {
        return res.status(400).json({ error: "Invalid email" });
    }

    try {
        const user = await User.findOne({ 
            where: { email: validation.data.email } 
        }) as UserInstance | null;

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Check if user has a password (not OAuth-only)
        if (!user.password) {
            return res.status(400).json({ 
                error: `This account uses ${user.primaryProvider} login and doesn't have a password to reset.`,
                provider: user.primaryProvider
            });
        }

        const token = crypto.randomUUID();

        const emailTemplate = {
            to: user.email,
            text: "This email is to reset your password. If you haven't requested it, ignore this email.",
            subject: "Reset password",
            html: `<strong>Password Reset Request</strong><br>Click <a href='${process.env.ROOT_DOMAIN}/auth/reset-password-form/${token}'>here</a> to reset your password`,
        };

        await MailManager.sendMail(emailTemplate);

        user.resetPasswordToken = token;
        await user.save();

        res.status(200).json({ message: "Email sent successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.get('/reset-password-form/:token', async (req: Request<{ token: string }>, res: Response) => {
    const filePath = path.join(process.cwd(), 'src', 'public', 'resetPasswordForm.html');
    res.sendFile(filePath);
});

authRouter.post('/reset-password/:token', async (req: ResetPasswordRequest, res: Response) => {
    const { token } = req.params;
    const validation = resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
    }

    try {
        const user = await User.findOne({ 
            where: { resetPasswordToken: token } 
        }) as UserInstance | null;

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

// ============================================
// OAUTH2 AUTHENTICATION
// ============================================

/**
 * Google OAuth
 */
authRouter.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_URL || '/'}/login?error=google_auth_failed`,
        session: false 
    }),
    (req: Request, res: Response) => {
        const user = req.user as UserInstance;
        const token = generateToken(user);
        setTokenCookie(res, token);
        
        res.redirect(`${process.env.FRONTEND_URL || '/'}/auth/success?token=${token}`);
    }
);

/**
 * GitHub OAuth
 */
authRouter.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

authRouter.get('/github/callback',
    passport.authenticate('github', { 
        failureRedirect: `${process.env.FRONTEND_URL || '/'}/login?error=github_auth_failed`,
        session: false 
    }),
    (req: Request, res: Response) => {
        const user = req.user as UserInstance;
        const token = generateToken(user);
        setTokenCookie(res, token);
        
        res.redirect(`${process.env.FRONTEND_URL || '/'}/auth/success?token=${token}`);
    }
);

/**
 * Microsoft OAuth
 */
authRouter.get('/microsoft',
    passport.authenticate('microsoft', { scope: ['user.read'] })
);

authRouter.get('/microsoft/callback',
    passport.authenticate('microsoft', { 
        failureRedirect: `${process.env.FRONTEND_URL || '/'}/login?error=microsoft_auth_failed`,
        session: false 
    }),
    (req: Request, res: Response) => {
        const user = req.user as UserInstance;
        const token = generateToken(user);
        setTokenCookie(res, token);
        
        res.redirect(`${process.env.FRONTEND_URL || '/'}/auth/success?token=${token}`);
    }
);

// ============================================
// SHARED ROUTES
// ============================================

authRouter.get('/profile', async (req: Request, res: Response) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password', 'resetPasswordToken'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

authRouter.get('/logout', (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('access_token');
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});