import { z } from "zod";

export const signupSchema = z.object({
    email: z.string({
        required_error: "Email is required",
    }).email({
        message: "Invalid email",
    }),
    password: z.string({
        required_error: "Password is required",
    }).min(6).max(50),
    confirmPassword: z.string({
        required_error: "Confirm password is required",
    }).min(6).max(50),
    name: z.string({
        required_error: "Name must be at least 3 characters and at most 25 characters",
    }).min(3).max(25).optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const loginSchema = z.object({
    email: z.string({
        required_error: "Email is required",
    }).email({
        message: "Invalid email",
    }),
    password: z.string({
        required_error: "Password is required",
    }).min(6).max(50),
})

export const emailSchema = z.string({
    email: z.string({
        required_error: "Email is required",
    }).email({
        message: "Invalid email",
    }),
})

export const resetPasswordSchema = z.object({
    password: z.string({
        required_error: "Password is required",
    }).min(6).max(50),
    confirmPassword: z.string({
        required_error: "Confirm password is required",
    }).min(6).max(50),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });