import { z } from "zod"

export const LoginSchema  = z.object({
  username: z.string().min(2, {
    message: "Username is required"
  }).max(50),
  password: z.string().min(6, {
    message: "Password is required"
  }),
})

export type LoginFormValues = z.infer<typeof LoginSchema>
