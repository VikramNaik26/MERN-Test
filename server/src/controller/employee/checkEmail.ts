import { Request, Response } from 'express'

import { User, IUser } from '../../model/User'
import { relogRequestHandler } from '../../middleware/request-middleware'

const checkEmployeeEmail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { email } = req.body

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Check if email exists in user's employees array
    const emailExists = user.employees.some(
      employee => employee.email.toLowerCase() === email.toLowerCase()
    )

    res.json({ exists: emailExists })
    return
  } catch (error) {
    console.error('Error checking email:', error)
    res.status(500).json({ 
      error: 'Failed to check email existence',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
    return
  }
}

export const checkEmail = relogRequestHandler(checkEmployeeEmail, { skipJwtAuth: false })
