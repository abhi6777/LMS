import appError from "../utils/appError.js";
import Course from "../models/course.model.js";

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

export { getAllCourses, getLectureByCourseId };