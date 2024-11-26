import { Router, text } from 'express';
import { User } from './models.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';
import { signupSchema, loginSchema, emailSchema, resetPasswordSchema } from './schemas.js';
import { MailManager } from '../Utils/mailManager.js';

export const authRouter = Router();


authRouter.post('/register', async (req, res) => {
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
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.post('/login', async (req, res) => {
    const reqBody = req.body;
    const validation = loginSchema.safeParse(reqBody);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
    }
    try {
        const user = await User.findOne({ where: { email: validation.email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        } else {
        }
        const checkPassword = await bcrypt.compare(validation.password, user.password);
        if (!checkPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        }).json(token);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

authRouter.get('/logout', (res) => {
    res.clearCookie('access_token').send();
})
authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const validation = emailSchema.safeParse({ email: email });
    if (!validation.success) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const user = await User.findOne({ where: { email: validation.data.email } });
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    try {
        const token = crypto.randomUUID();

        const emailTemplate = {
            to: user.email,
            text: "This email is to reset your password. If you haven't requested it, ignore this email.",
            subject: "Reset password",
            html: `<strong>it works!</strong><br>Click <a href='${process.env.ROOT_DOMAIN}/auth/reset-password-form/${token}'>here</a> to reset your password`,
        }
        MailManager.sendMail(emailTemplate);

        if (error) {
            return res.status(400).json({ error });
        }
        user.resetPasswordToken = token;
        res.status(200).json({ "message": "Email sent successfully" });
        await user.save();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

authRouter.get('/reset-password-form/:token', async (req, res) => {
    const { token } = req.params;
    const filePath = path.join(process.cwd(), 'src', 'public', 'resetPasswordForm.html');
    res.sendFile(filePath);
})

authRouter.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const passwords = req.body;
    const validation = resetPasswordSchema.safeParse(passwords);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
    }
    try {
        const user = await User.findOne({ where: { resetPasswordToken: token } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const hashedPassword = await bcrypt.hash(validation.password, 10)
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.save();
        res.status(200).json({ "message": "Password changed successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})