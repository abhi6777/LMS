import express from 'express';
import { getAllCourses, getLectureByCourseId, createCourse, updateCourse, deleteCourse } from '../controllers/courses.controllers.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/')
     .get(getAllCourses)
     .post(upload.single('thumbnail'), createCourse);

router.route('/:courseId')
     .get(isLoggedIn, getLectureByCourseId)
     .put(updateCourse)
     .delete(deleteCourse);

export default router;