import { Document, Schema } from 'mongoose'

export interface IEmployee extends Document {
  name: string
  email: string
  mobile: string
  designation: "HR" | "Manager" | "Sales"
  gender: "M" | "F"
  course: string[]
  image: {
    data: Buffer
    contentType: string
  }
}

export const EmployeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, maxlength: 255, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
  designation: { type: String, required: true, enum: ["HR", "Manager", "Sales"] },
  gender: { type: String, required: true, enum: ["M", "F"] },
  course: { type: [String], required: true, enum: ["MCA", "BCA", "BSC"], minlength: 1, maxlength: 3 },
  image: {
    data: Buffer,
    contentType: String,
  }
})

