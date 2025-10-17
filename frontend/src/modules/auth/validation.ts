import z from "zod";

export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
    });

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;