import appError from "../utils/appError.js";
import Course from "../models/course.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

const getAllCourses = async (req, res, next ) => {
     try {
          const courses = await Course.find({}).select('-lecture');
          
          res.status(200).json({
               success: true,
               message: 'All Courses',
               courses
          });

     } catch (error) {
          return next(new appError(error.message, 500));
     };
};

const getLectureByCourseId = async (req, res, next) => {
     try {
          const { courseId } = req.params;
          const course = await Course.findById(courseId);

          if (!course) {
               return next(new appError('Invalid Course Id', 400));
          };

          res.status(200).json({
               success: true,
               message: "Course Lecture Fetched Successfully",
               lectures: course.lectures
          });

     } catch (error) {
          return next(new appError(`Error!!! Lectures Not Found ${error}`, 400));
     }
};

const createCourse = async (req, res, next) => {
     try {
          const { title, description, category, createdBy } = req.body;

          if (!title || !description || !category || !createdBy) {
               return next(new appError("All Fields are Required", 400));
          };

          if (!req.file) {
               return next(new appError("Thumbnail file is required", 400));
          };
          
          const result = await cloudinary.uploader.upload(req.file.path, {
               folder: 'lms',
          });

          await fs.rm(`uploads/${req.file.filename}`);

          const course = await Course.create({
               title,
               description,
               category,
               createdBy,
               thumbnail: {
               public_id: result.public_id,
               secure_url: result.secure_url
               }
          });

          res.status(200).json({
               success: true,
               message: "Course Created successfully",
               course
          });

     } catch (error) {
          return next(new appError(`Failed to add Course ${error}`, 400));
     }
};

const updateCourse = async (req, res, next) => {
     try {
          const { courseId } = req.params;

          if(!courseId) {
               return next(new appError("CourseId is required ", 400));
          };

          const course = await Course.findByIdAndUpdate(
               courseId,
               {
                    $set: req.body
               },
               {
                    runValidators: true
               }
          );

          if(!course) {
               return next(new appError("Course Not Found", 400));
          };

          res.status(200).json({
               success: true,
               Message: "Course Updated Successfully",
               course
          });
          
     } catch (error) {
          return next(new appError(`Course update failed ${error.message}`, 400));
     };
};

const deleteCourse = async (req, res, next) => {
     try {
          const { courseId } = req.params;

          if (!courseId) {
               return next(new appError("CourseId is required"), 400);
          };

          const course = await Course.findById(courseId);
          console.log(course);

          await Course.deleteOne({ _id: courseId})

          res.status(200).json({
               success: true,
               message: `This ${courseId} course is deleted Successfully`,
               course
          });
          
     } catch (error) {
          return next(new appError(`Course Delete failed ${error.message}`, 400));
     }
};

export { getAllCourses, getLectureByCourseId, createCourse, updateCourse, deleteCourse };