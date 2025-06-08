import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Email is required"],
        minLength: [5, "Name must be 5 characters"],
        maxLength: [50, "Name must be less than 50 characters"],
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
        required: [true, "Password is required"],
        minLength: [8, "Password must be 8 characters long"],
        select: false,
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    avatar: {
        public_id: String,
        secure_url: String
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
        return jwt.sign(
            {
               id: this.id,
               role: this.role,
               email: this.email,
               subscription: this.subscription
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY }
        );
    },
    generatePasswordToken: function() {
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes

        return resetToken;
    }
};

const User = mongoose.model("User", userSchema);

export { User };