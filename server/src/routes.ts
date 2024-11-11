import { Router } from 'express'
import multer from 'multer'

import * as AuthController from './controller/auth'
import * as EmployeeController from './controller/employee'

export const router = Router()


const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  },
})

router.post('/login', AuthController.login)
router.post('/register', AuthController.register)

router.post('/:userId/createEmp',upload.single('image'), EmployeeController.create)
router.post('/:userId/checkEmail', EmployeeController.checkEmail)
router.get('/:userId/employees', EmployeeController.getEmployees)
