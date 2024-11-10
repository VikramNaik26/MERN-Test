import { RequestHandler } from 'express'
import Joi from '@hapi/joi'

import { relogRequestHandler } from '../../middleware/request-middleware'
import { User } from '../../model/User'

export const addUserSchema = Joi.object().keys({
  username: Joi.string()
    .alphanum()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 2 characters long',
      'string.max': 'Username must be at most 30 characters long',
      'any.required': 'Username is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
  confPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Confirm password is required',
    }),
})

const registerWrapper: RequestHandler = async (req, res) => {
  const { username, password, confPassword } = req.body

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    res.status(409).json({
      success: false,
      message: 'Username is already taken',
    })
    return
  }

  if (password !== confPassword) {
    res.status(400).json({
      success: false,
      message: 'Passwords do not match',
    })
    return
  }

  const user = new User({
    username,
    password: '',
    createdOn: Date.now(),
  })

  user.password = user.encryptPassword(password)

  await user.save()

  res.status(201).json({ success: true, user: user.toJSON() })
  return
}

export const register = relogRequestHandler(registerWrapper, { validation: { body: addUserSchema }, skipJwtAuth: true })
