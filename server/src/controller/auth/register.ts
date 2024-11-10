import { RequestHandler } from 'express'
import Joi from '@hapi/joi'

import { relogRequestHandler } from '../../middleware/request-middleware'
import { User } from '../../model/User'

export const addUserSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
})

const registerWrapper: RequestHandler = async (req, res) => {
  const {
    username, password
  } = req.body

  const user = new User({
    username, password, createdOn: Date.now()
  })
  user.password = user.encryptPassword(password)

  await user.save()

  res.status(201).json(user.toJSON())
  return
}

export const register = relogRequestHandler(registerWrapper, { validation: { body: addUserSchema }, skipJwtAuth: true })
