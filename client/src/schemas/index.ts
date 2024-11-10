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

export const EmployeeSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
  email: z.string()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be at most 255 characters" }),
  mobile: z.string()
    .regex(/^[0-9]{10}$/, { message: "Mobile number must be 10 digits" }),
  designation: z.enum(["HR", "Manager", "Sales"], {
    errorMap: () => ({ message: "Please select a valid designation" }),
  }),
  gender: z.enum(["M", "F"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  course: z.array(z.enum(["MCA", "BCA", "BSC"]))
    .min(1, { message: "Please select at least one course" })
    .max(3, { message: "You can select up to 3 courses" }),
  image: z.instanceof(File)
    .refine((file) => file.size <= 5000000, { message: "Image must be less than 5MB" })
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      { message: "Only .jpg and .png formats are supported" }
    ),
})

export type EmployeeFormValues = z.infer<typeof EmployeeSchema>
