import { Request, Response } from 'express'

import { User } from '../../model/User'
import { IEmployee } from '../../model/Employee'
import { relogRequestHandler } from '../../middleware/request-middleware'

const createEmployee = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const employeeData: IEmployee = req.body 

    if (typeof employeeData.course === 'string') {
      employeeData.course = JSON.parse(employeeData.course)
    }

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Check if email already exists
    const emailExists = user.employees.some(
      (employee) => employee.email.toLowerCase() === employeeData.email.toLowerCase()
    )

    if (emailExists) {
      res.status(409).json({ error: 'Employee with this email already exists' })
      return
    }

    // Handle image if it exists
    if (req.file) {
      employeeData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      }
    }

    // Add employee to user's employees array
    user.employees.push(employeeData)
    user.updatedOn = new Date()

    await user.save()

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        ...employeeData,
        image: req.file ? { contentType: req.file.mimetype } : undefined,
      },
    })
    return
  } catch (error) {
    console.error('Error creating employee:', error)
    res.status(500).json({
      error: 'Failed to create employee',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
    return
  }
}

export const create = relogRequestHandler(createEmployee, { skipJwtAuth: false })

