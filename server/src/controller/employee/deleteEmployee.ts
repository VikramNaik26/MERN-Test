import { Request, Response } from 'express'
import { isValidObjectId } from 'mongoose'

import { User } from '../../model/User'
import { relogRequestHandler } from '../../middleware/request-middleware'

const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, employeeId } = req.params
    console.log("userId", userId)
    console.log("employeeId", employeeId)

    // Validate IDs
    if (!isValidObjectId(userId) || !isValidObjectId(employeeId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID or employee ID format'
      })
      return
    }

    // Find user and update to pull employee from array
    const result = await User.updateOne(
      { _id: userId },
      {
        $pull: {
          employees: { _id: employeeId }
        }
      }
    )

    if (result.modifiedCount === 0) {
      res.status(404).json({
        success: false,
        error: 'Employee not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting employee:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
}

export const deleteEmployeeController = relogRequestHandler(deleteEmployee, { skipJwtAuth: false })
