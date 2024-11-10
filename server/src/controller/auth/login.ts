import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import { relogRequestHandler } from '../../middleware/request-middleware'
import { User } from '../../model/User'

const loginWrapper: RequestHandler = async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })

  if (user && user.validPassword(password)) {
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
      token,
      uid: user._id
    })
    return
  }

  res.status(403).json({
    message: 'Auth failed'
  })
  return

}
export const login = relogRequestHandler(loginWrapper, { skipJwtAuth: true })
