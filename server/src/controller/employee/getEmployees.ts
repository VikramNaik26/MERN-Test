import { Request, Response } from 'express'
import { isValidObjectId } from 'mongoose'

import { User } from '../../model/User'
import { relogRequestHandler } from '../../middleware/request-middleware'

const getEmployeesList = async (req: Request, res: Response): Promise<void> => {
  console.log("req.params", req.params)
  try {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      })
      return
    }

    const user = await User.findById(userId)
      .select('employees')
      .lean()

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    const employees = user.employees || []

    res.status(200).json({
      success: true,
      data: {
        employees,
        count: employees.length
      }
    })
    return
  } catch (error) {
    console.error('Error fetching employees:', error)

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
}

export const getEmployees = relogRequestHandler(getEmployeesList, { skipJwtAuth: false })
