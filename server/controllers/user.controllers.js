import appError from '../utils/appError.js';
import { User } from '../models/user.model.js';
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

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

const forgotPassword = async (req, res, next) => {};

const resetPassword = async (req, res, next) => {};

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword
};