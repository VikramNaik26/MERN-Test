import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "lucide-react"

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { LoginSchema, LoginFormValues } from "@/schemas"

interface LoginFormProps {
  onLoginSuccess?: (data: LoginFormValues) => void;
  onLoginError?: (error: Error) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    }
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      setIsLoading(true)
      setError("")
      
      // TODO: Simulate API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1000))
      
      console.log(values)
      onLoginSuccess?.(values)
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
          <Button variant="link" className="p-0 h-auto font-normal">
            Sign up
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

