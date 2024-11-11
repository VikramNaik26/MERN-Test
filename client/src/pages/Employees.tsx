'use client'

import { useEffect, useState } from 'react'
import { Edit, Trash2, Search, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from 'react-router-dom'
import { authUtils } from '@/lib/authUtils'

interface Employee {
  _id: string
  name: string
  email: string
  mobile: string
  designation: "HR" | "Manager" | "Sales"
  gender: "M" | "F"
  course: string[]
  image: {
    data: string
    contentType: string
  }
  createdOn: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface EmployeesResponse {
  employees: Employee[]
  count: number
}

const fetchEmployees = async (userId: string): Promise<Employee[]> => {
  const authToken = localStorage.getItem("authToken")

  if (!authToken) {
    throw new Error('Authentication token not found')
  }

  try {
    const response = await fetch(`http://localhost:3000/api/${userId}/employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch employees')
    }

    const data: ApiResponse<EmployeesResponse> = await response.json()

    if (!data.success || !data.data) {
      throw new Error('Failed to fetch employees')
    }

    return data.data.employees
  } catch (error) {
    console.error('Error fetching employees:', error)
    throw error
  }
}

export default function Employees() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true)
      try {
        const userId = authUtils.getCurrentUser()?._id
        const data = await fetchEmployees(userId)
        setEmployees(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadEmployees()
  }, [])

  console.log(employees)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="font-semibold">
              Logo
            </Link>
            <nav className="flex gap-4">
              <Link to="/dashboard" className="text-sm font-medium">
                Home
              </Link>
              <Link to="dasboard/employees" className="text-sm font-medium">
                Employee List
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm">Hukum Gupta</span>
            <Button variant="ghost" size="icon" onClick={() => authUtils.logout()}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employee List</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Total Count:</span>
              <span className="text-sm">{employees.length}</span>
            </div>
            <Button asChild>
              <Link to="/dashboard">Create Employee</Link>
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter Search Keyword"
              className="pl-8"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Unique Id</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile No</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>{employee._id}</TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage
                        src={`data:${employee.image.contentType};base64,${employee.image.data}`}
                        alt={employee.name}
                      />
                      <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.mobile}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.gender === 'M' ? 'Male' : 'Female'}</TableCell>
                  <TableCell>{employee.course.join(', ')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
