import { useState } from "react"
import { Loader2, LogOut, Plus, Users } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { useNavigate } from 'react-router-dom'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { authUtils } from "@/lib/authUtils"
import { EmployeeSchema, EmployeeFormValues } from "@/schemas"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from '@/components/ui/toast'

export default function Component() {
  const [showCreateEmployee, setShowCreateEmployee] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { toast } = useToast()
  const navigate = useNavigate()

  const onEmpCreationSuccess = (data: EmployeeFormValues) => {
    toast({
      title: "Employee successfully created",
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

  const onEmployeeCreationError = (error: Error) => {
    toast({
      variant: "destructive",
      title: "Employee Creation Failed",
      description: error.message || "Please try again later.",
      action: (
        <ToastAction altText="Try again">Try again</ToastAction>
      ),
      duration: 5000,
    })

    console.error("Registration error:", error)
  }

  const username = authUtils.getCurrentUser()?.username

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      designation: "Sales",
      gender: "M",
      course: [],
      image: undefined,
    }
  })


  const onSubmit = async (values: EmployeeFormValues): Promise<void> => {
    setIsLoading(true)

    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      throw new Error('Authentication token not found')
    }

    const userId = authUtils.getCurrentUser()?._id
    if (!userId) {
      throw new Error('User ID not found')
    }

    try {
      const checkEmailResponse = await fetch(
        `http://localhost:3000/api/${userId}/checkEmail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ email: values.email.toLowerCase().trim() })
        }
      )

      if (!checkEmailResponse.ok) {
        throw new Error('Failed to check email existence')
      }

      const emailCheckResult = await checkEmailResponse.json()

      if (emailCheckResult.exists) {
        alert('An employee with this email already exists')
        setIsLoading(false)
        return
      }
    } catch (emailCheckError) {
      console.error("Error checking email:", emailCheckError)
      throw new Error('Failed to verify email uniqueness')
    }

    try {
      const formData = new FormData()

      formData.append('name', values.name.trim())
      formData.append('email', values.email.toLowerCase().trim())
      formData.append('mobile', values.mobile.trim())
      formData.append('designation', values.designation)
      formData.append('gender', values.gender)
      formData.append('course', JSON.stringify(values.course))

      if (values.image instanceof File) {
        formData.append('image', values.image)
      }

      const requestId = crypto.randomUUID()

      const authToken = localStorage.getItem("authToken")
      if (!authToken) {
        throw new Error('Authentication token not found')
      }

      const userId = authUtils.getCurrentUser()?._id
      if (!userId) {
        throw new Error('User ID not found')
      }

      const response = await fetch(`http://localhost:3000/api/${userId}/createEmp`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "X-Request-ID": requestId,
          "authorization": `Bearer ${authToken}`
        },
        body: formData,
      })

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error('Invalid request data')
          case 401:
            throw new Error('Unauthorized access')
          case 403:
            throw new Error('Permission denied')
          case 413:
            throw new Error('File size too large')
          default:
            throw new Error(`Server error: ${response.status}`)
        }
      }

      const data = await response.json()

      if (!data || typeof data !== 'object') {
        onEmployeeCreationError(data)
      }

      console.log('Employee created successfully:', data)
      onEmpCreationSuccess(data)

      form.reset()
      setShowCreateEmployee(false)

    } catch (err) {
      console.error("An error occurred during employee creation:", err)
      if (err instanceof Error) {
        onEmployeeCreationError(err)
      } else {
        alert('An unexpected error occurred')
      }

    } finally {
      setIsLoading(false)
    }
  }

  const courses = [
    { id: "MCA", label: "MCA" },
    { id: "BCA", label: "BCA" },
    { id: "BSC", label: "BSC" },
  ] as const

  return (
    <div className="min-h-screen bg-background w-full mx-auto">
      <header className="border-b mx-auto">
        <div className="container flex h-16 items-center px-4 mx-auto">
          <div className="mr-8 font-bold">Logo</div>
          <NavigationMenu>
            <NavigationMenuList className="flex gap-5">
              <NavigationMenuItem>
                <Link to="/dashboard">
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                Employee List
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm font-medium">{username}</span>
            <Button variant="ghost" size="icon" onClick={() => authUtils.logout()}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 mx-auto">
        {!showCreateEmployee ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Welcome Admin Panel</h1>
              <div className="space-x-2">
                <Button onClick={() => setShowCreateEmployee(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Employee
                </Button>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Employee List
                </Button>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
                <CardDescription>
                  Manage your employees and organization from here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add dashboard content here */}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create Employee</CardTitle>
              <CardDescription>Add a new employee to the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder="Enter your name"
                            className="w-full"
                            autoComplete="name"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            type="email"
                            placeholder="Enter your email"
                            className="w-full"
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Mobile no</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            type="tel"
                            placeholder="Enter your mobile no"
                            className="w-full"
                            autoComplete="tel"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Designation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            disabled={isLoading}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="M" id="male" />
                              <Label htmlFor="male">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="F" id="female" />
                              <Label htmlFor="female">Female</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="course"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Course</FormLabel>
                          <FormDescription>
                            Select the courses you want
                          </FormDescription>
                        </div>
                        {courses.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="course"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      disabled={isLoading}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => {
                      const [preview, setPreview] = useState<string | null>(null)

                      return (
                        <FormItem>
                          <FormLabel className="text-foreground">Image Upload</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept="image/*"
                                className="w-full"
                                disabled={isLoading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    field.onChange(file)
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      setPreview(reader.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                              {preview && (
                                <div className="relative h-32 w-32">
                                  <img
                                    src={preview}
                                    alt="Image preview"
                                    className="rounded-md"
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateEmployee(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
