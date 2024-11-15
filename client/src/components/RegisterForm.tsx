import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useNavigate } from 'react-router-dom'

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RegisterSchema, RegisterFormValues } from "@/schemas"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from '@/components/ui/toast'

export const RegisterForm: React.FC = () => {
  const { toast } = useToast()
  const navigate = useNavigate()

  const onRegisterSuccess = (data: RegisterFormValues) => {
    toast({
      title: "Registration Successful",
      description: "Your account has been created successfully.",
      className: "bg-background border-border",
      action: (
        <ToastAction altText="Go to login" onClick={() => navigate('/login')}>
          Login now
        </ToastAction>
      ),
      duration: 3000,
    })

    setTimeout(() => {
      navigate('/login', {
        state: {
          username: data.username,
          fromRegistration: true
        }
      })
    }, 1500)
  }

  const onRegisterError = (error: Error) => {
    toast({
      variant: "destructive",
      title: "Registration Failed",
      description: error.message || "Please try again later.",
      action: (
        <ToastAction altText="Try again">Try again</ToastAction>
      ),
      duration: 5000,
    })

    console.error("Registration error:", error)
  }

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confPassword: ""
    }
  })

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    try {
      setIsLoading(true)
      setError("")

      const response: Response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Request-ID": crypto.randomUUID()
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (data.success) {
        onRegisterSuccess?.(values)
      } else {
        data.message && setError(data.message)
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred')
      setError("An error occurred during login. Please try again.")
      onRegisterError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md m-auto shadow-lg max-sm:border-none max-sm:shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="Enter your username"
                      className="w-full"
                      autoComplete="username"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      type="password"
                      placeholder="Enter your password"
                      className="w-full"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:text-primary/90 font-medium hover:underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
