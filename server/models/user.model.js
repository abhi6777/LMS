const {Schema, model, default: mongoose} = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
     fullName: {
          type: String,
          required: [true, "Email is required"],
          minLength: [5, "Name must be 5 character"],
          maxLength: [50, "Name must be less than 50 character"],
          lowercase: true,
          trim: true
     },
     email: {
          type: String,
          required: [true, "Email is required"],
          unique: true,
          lowercase: true,
          trim: true,
          match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"]
     },
     password: {
          type: String,
          required: [true, "password is required"],
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
});

userSchema.pre("save", async function (next) {
     if (this.isModified("password")) {
          this.password = await bcrypt.hash(this.password, 10);
     }
     next(); 
});

userSchema.methods = {
     comparePassword: async function (enteredPassword) {
          return await bcrypt.compare(enteredPassword, this.password);
     },
     generateJWTToken: function () {
          const token = jwt.sign(
               { _id: this._id, role: this.role, email: this.email, subscription: this.subscription },
               process.env.JWT_SECRET,
               {
               expiresIn: process.env.JWT_EXPIRY}
          );
          return token;
     }
}


const User = mongoose.model("User", userSchema);

module.exports = { User };