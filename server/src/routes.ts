import { Router } from 'express'

import * as AuthController from './controller/auth'

export const router = Router()

// Auth routes
router.post('/login', AuthController.login)
router.post('/register', AuthController.register)

