const appError = require("../utils/appError");
const { User } = require("../models/user.model.js");
const bcrypt = require("bcrypt");

const cookieOptions = {
     secure: true,
     maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
     httpOnly: true
}

const register = async (req, res) => {
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

          // Upload user Picture

          await user.save();

          // Todo: set jwt token in cookie

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

const login = async (req, res) => { 
     try {
          const { email, password } = req.body;

          if (!email || !password) {
               return next(new appError("All Fields are Required", 400));
          }

          const user = await User.findOne({ email }).select("+password");

          // If username and password does not match
          if (!user || !(await user.comparePassword(password))) {
               return next(new appError("Invalid Email or Password", 400));
          }

          // Generate JWT token
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

const logout = async (req, res) => { 
     try {
          res.cookie('token', null, {
               secure: true,
               maxAge: 0,
               httpOnly: true
          });

          res.status(200).json({
               success: true,
               message: "User logged out successfully"
          })          
     } catch (error) {
          return next(new appError("LogOut Failed", 400));
     }
};

const getProfile = async (req, res) => { 
     try {
          const user = await User.findById(req.user.id);

          res.status(200).json({
               success: true,
               message: "User Details",
               user
          })
     } catch (error) {
          return next(new appError("Cannot load Profile", 400));
     }
};

module.exports = {
     register,
     login,
     logout,
     getProfile
};
