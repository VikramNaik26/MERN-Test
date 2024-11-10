import { Document, Model, Schema, model } from 'mongoose'
import { hashSync, genSaltSync, compareSync } from 'bcrypt'

import { IEmployee, EmployeeSchema } from './Employee'

// Define the IUser interface
export interface IUser extends Document {
  username: string
  password: string
  createdOn: Date
  updatedOn: Date
  employees: IEmployee[] // Use IEmployee type for employees
  encryptPassword: (password: string) => string
  validPassword: (password: string) => boolean
}

interface IUserModel extends Model<IUser> {}

// Define the User schema
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdOn: { type: Date, required: true, default: Date.now },
  updatedOn: { type: Date, required: true, default: Date.now },
  employees: [EmployeeSchema], // Use EmployeeSchema for employees array
})

// Add methods for password encryption and validation
UserSchema.methods.encryptPassword = (password: string) => hashSync(password, genSaltSync(10))

UserSchema.methods.validPassword = function (password: string) {
  return compareSync(password, this.password)
}

export const User = model<IUser, IUserModel>('User', UserSchema)

