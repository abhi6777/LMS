import express from 'express';
import { getAllCourses, getLectureByCourseId, createCourse, updateCourse, deleteCourse, addLectureToCourseById } from '../controllers/courses.controllers.js';
import { isLoggedIn, authorizedRoles, authorizedSubscribers } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/')
     .get(getAllCourses)
     .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('thumbnail'), createCourse);

router.route('/:courseId')
     .get(isLoggedIn, authorizedSubscribers, getLectureByCourseId)
     .put(isLoggedIn, authorizedRoles('ADMIN'), updateCourse)
     .delete(isLoggedIn, authorizedRoles('ADMIN'), deleteCourse)
     .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('lecture'),  addLectureToCourseById);

export default router;