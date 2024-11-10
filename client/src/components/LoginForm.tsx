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
import { LoginSchema, LoginFormValues } from "@/schemas"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from '@/components/ui/toast'

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    role?: string;
  };
}


export const LoginForm: React.FC = () => {
  const { toast } = useToast()
  const navigate = useNavigate()

  const onLoginSuccess = (data: LoginFormValues & Partial<LoginResponse>) => {

    try {
      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }

      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user.username ?? ""))
      }

      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${data.user?.username}`,
        className: "bg-background border-border",
        duration: 2000,
      })

      console.log("Login successful for user:", data.user?.username)

      navigate('/dashboard', {
        replace: true,
        state: {
          loggedIn: true,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error("Error in login success handler:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem completing your login. Please try again.",
        duration: 3000,
      })
    }
  }

  const onLoginError = (error: Error) => {
    let errorMessage = "Please try again later."

    if (error.message.includes("credentials")) {
      errorMessage = "Invalid username or password."
    } else if (error.message.includes("network")) {
      errorMessage = "Network error. Please check your connection."
    } else if (error.message.includes("locked")) {
      errorMessage = "Account temporarily locked. Please try again later."
    }

    toast({
      variant: "destructive",
      title: "Login Failed",
      description: errorMessage,
      action: (
        <ToastAction altText="Try again">Try again</ToastAction>
      ),
      duration: 5000,
    })

    console.error("Login error:", {
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    })
  }
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    }
  })

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      setIsLoading(true)
      setError("")

      const response: Response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        console.log(data)
        onLoginSuccess?.(data)
      } else {
        data.message && setError(data.message)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred')
      setError("An error occurred during login. Please try again.")
      onLoginError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md m-auto shadow-lg max-sm:border-none max-sm:shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
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
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button variant="link" className="text-sm text-muted-foreground hover:text-primary hover:no-underline">
          Forgot password?
        </Button>
        <div className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:text-primary/90 font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

