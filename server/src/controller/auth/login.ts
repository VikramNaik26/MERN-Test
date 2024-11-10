import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import Joi from '@hapi/joi'

import { relogRequestHandler } from '../../middleware/request-middleware'
import { User } from '../../model/User'

const loginSchema = Joi.object({
  username: Joi.string().min(2).max(50).required().messages({
    'string.base': 'Username should be a string',
    'string.empty': 'Username cannot be empty',
    'string.min': 'Username should have at least 2 characters',
    'string.max': 'Username should have at most 50 characters',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password should be a string',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password should have at least 6 characters',
    'any.required': 'Password is required'
  }),
})

const loginWrapper: RequestHandler = async (req, res) => {
  const { error } = loginSchema.validate(req.body)

  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    })
    return
  }

  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User does not exist'
      })
      return
    }
    const { password, ...userWithoutPassword } = user.toObject();

    if (user.validPassword(password)) {
      const token = jwt.sign(
        {
          email: user.username,
          userId: user._id
        },
        process.env.SECRET!,
        {
          expiresIn: '12h'
        }
      )
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword
      })
      return
    }

    res.status(403).json({
      message: 'Invalid password'
    })
    return
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        message: 'An error occurred during login. Please try again later.',
        error: err.message
      })
    } else {
      res.status(500).json({
        message: 'An unknown error occurred during login'
      })
    }
    return
  }
}

export const login = relogRequestHandler(loginWrapper, { skipJwtAuth: true })

