import bodyParser from 'body-parser'
import compression from 'compression'
import path from 'path'
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

import { ApplicationError } from './error/application-error'
import { router } from './routes'

export const app = express()

app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 3000)
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))
app.use('/api', router)

const errorHandler: ErrorRequestHandler = (
  err: ApplicationError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err)
    return
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err : undefined,
    message: err.message
  })
}

app.use(errorHandler)
