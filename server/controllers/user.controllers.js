import appError from '../utils/appError.js';
import { User } from '../models/user.model.js';
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import sendMail from '../utils/sendEmail.js';
import crypto from 'crypto';
import { error } from 'console';
import { compare } from 'bcrypt';

const cookieOptions = {
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true
};

const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return next(new appError("All Fields are Required", 400));
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return next(new appError("Email Already Exists", 400));
        }

        const user = await User.create({
            fullName,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url: process.env.SECURE_URL
            }
        });

        if (!user) {
            return next(new appError("User registration failed, please try again", 400));
        }

        // upload user picture 
        if(req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: '250',
                    height: '250',
                    gravity: 'faces',
                    crop: 'fill'
                });

                if (result) {
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;

                    // remove file from the local server 
                    await fs.rm(`./uploads/${req.file.filename}`);
                };

            } catch (error) {
                return next(new appError(error.message || "File not uploaded plz try again", 500));
            };
        };

        await user.save();

        // Get JWT token in cookies
        const token = user.generateJWTToken();
        res.cookie('token', token, cookieOptions);

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "User Registration Successful",
            user
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new appError("All Fields are Required", 400));
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.comparePassword(password))) {
            return next(new appError("Invalid Email or Password", 400));
        }

        const token = user.generateJWTToken();
        user.password = undefined;

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "User Login Successful",
            user
        });
    } catch (error) {
        console.error("Login Error:", error);
        return next(new appError("Login Failed", 400));
    }
};

const logout = async (req, res, next) => {
    try {
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        return next(new appError("LogOut Failed", 400));
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            message: "User Details",
            user
        });
    } catch (error) {
        return next(new appError("Cannot load Profile", 400));
    }
};

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if(!email) {
        return next(new appError("Email is required", 400));
    };

    const user = await User.findOne({ email });

    if(!user){
        return next(new appError("Email not registered", 400));
    };

    const resetToken = await user.generatePasswordToken();

    await user.save();
    
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-Password/${resetToken}`;
    const subject = `Reset Password`;
    const message = `You can reset Password by clicking <a href=${resetPasswordUrl} target="_blank"> Reset your Password</a>\n If the above link does not does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this , kindly inform us`;

    console.log(resetPasswordUrl);
    try {
        // create send email address

        await sendMail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password mail is sent to ${email} successfully`
        })
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save();
        return next(new appError(`${error.message}`, 400));
    };
};

const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    const user = await User.findOne({ forgotPasswordToken, forgotPasswordExpiry: { $gt: Date.now()} });

    if (!user) {
        return next(new appError("Token is invalid or expired, please try again ", 400));
    };

    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "password change successfully"
    });
};

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if(!oldPassword || !newPassword ) {
        return next( new appError("All fields are mandatory", 400));
    };

    const user = await User.findById(id).select(+password);

    if(!user) {
        return next(new appError("user Does not exists", 400));
    };

    const isPasswordValid = await User.comparePassword(password);

    if(!isPasswordValid) {
        return next(new appError("Invalid old Password", 400));
    };

    user.password = newPassword;

    user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Password change successfully",
        user
    });
};


// Exporting to router.js
export { register, login, logout, getProfile, forgotPassword, resetPassword };