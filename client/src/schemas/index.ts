import { z } from "zod"

export const LoginSchema = z.object({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(50, { message: "Username must be at most 50 characters" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Username must contain only alphanumeric characters" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be at most 100 characters" })
})

export type LoginFormValues = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(50, { message: "Username must be at most 50 characters" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Username must contain only alphanumeric characters" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be at most 100 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, { 
      message: "Password must include at least one uppercase letter, one lowercase letter, and one number" 
    }),
  confPassword: z.string()
    .min(6, { message: "Password confirmation must be at least 6 characters" })
}).refine(data => data.password === data.confPassword, {
  path: ['confPassword'], 
  message: "Passwords do not match",
})

export type RegisterFormValues = z.infer<typeof RegisterSchema>

