import { LoginFormValues, RegisterFormValues } from "@/schemas"

export const onRegisterSuccess = (data: RegisterFormValues) => {
  console.log(data)
}

export const onRegisterError = (data: Error) => {
  console.log(data)
}

export const onLoginSuccess = (data: LoginFormValues) => {
  console.log(data)
}

export const onLoginError = (data: Error) => {
  console.log(data)
}
