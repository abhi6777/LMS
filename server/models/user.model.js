const {Schema, model} = require("mongoose");

const userSchema = new Schema({
     fullName: {
          type: String,
          require: [true, "Email is required"],
          minLength: [5, "Name must be 5 character"],
          maxLength: [50, "Name must be less than 50 character"],
          lowercase: true,
          trim: true
     },
     email: {
          type: String,
          require: [true, "Email is required"],
          unique: true,
          lowercase: true,
          trim: true,
          match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"]
     },
     password: {
          type: String,
          require: [true, "password is required"],
          minLength: [8, "password must be 8 characters long"],
          select: false,
     },
     role: {
          type: String,
          enum: ['USER', 'ADMIN'],
          default: 'USER'
     },
     avatar: {
          public_id: {
               type: String,
          },
          secure_url: {
               type: String,
          }
     },
     forgotPasswordToken: String,
     forgotPasswordExpiry: Date
}, {
     timestamps: true
})