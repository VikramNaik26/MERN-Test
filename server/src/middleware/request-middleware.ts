import {
  RequestHandler, Request, Response, NextFunction
} from 'express'
import jwt from 'jsonwebtoken'
import Joi from '@hapi/joi'
import { BadRequest, UnauthorizedRequest } from '../error'
import { logger } from '../logger'

const getMessageFromJoiError = (error: Joi.ValidationError): string | undefined => {
  if (!error.details && error.message) {
    return error.message
  }
  return error.details && error.details.length > 0 && error.details[0].message
    ? `PATH: [${error.details[0].path}]  MESSAGE: ${error.details[0].message}` : undefined
}

interface HandlerOptions {
  validation?: {
    body?: Joi.ObjectSchema
  },
  skipJwtAuth?: boolean
}

/**
 * Enhanced request handler wrapper that properly handles authentication,
 * validation, and error handling for Express routes
 * @param handler Request handler to check for error
 * @param options Configuration options for validation and JWT auth
 */
export const relogRequestHandler = (
  handler: RequestHandler,
  options?: HandlerOptions,
): RequestHandler => async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.log({
      level: 'info',
      message: req.url
    })

    // JWT Authentication
    if (!options?.skipJwtAuth) {
      const token = req.headers['authorization']
      if (!token) {
        logger.log({
          level: 'info',
          message: 'Auth token is not supplied'
        })
        throw new UnauthorizedRequest('Auth token is not supplied')
      }

      try {
        const decoded = await new Promise((resolve, reject) => {
          jwt.verify(
            token.replace(/^Bearer\s+/, ''),
            process.env.SECRET ?? '',
            (err, decoded) => {
              if (err) reject(err)
              else resolve(decoded)
            }
          )
        })

        // Optionally attach decoded token to request for later use
        req.user = decoded
      } catch (err) {
        logger.log({
          level: 'info',
          message: 'Token Validation Failed'
        })
        throw new UnauthorizedRequest('Invalid or expired token')
      }
    }

    // Request body validation
    if (options?.validation?.body) {
      const { error } = options.validation.body.validate(req.body)
      if (error) {
        throw new BadRequest(getMessageFromJoiError(error))
      }
    }
      
    // Handle the main request
    const result = handler(req, res, next)
    if (result instanceof Promise) {
      await result
    }
  } catch (err) {
    // Logging in development
    if (process.env.NODE_ENV === 'development') {
      logger.log({
        level: 'error',
        message: 'Error in request handler',
        error: err
      })
    }

    // Ensure we're not calling next() if the response has already been sent
    if (!res.headersSent) {
      next(err)
    }
  }
}

// Type declaration for the decoded user information
declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}
