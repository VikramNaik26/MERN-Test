import { Router } from 'express'

import * as AuthController from './controller/auth'

export const router = Router()

// Auth routes
router.post('/login', AuthController.loginWrapper)
router.get('/login', AuthController.loginWrapper)
