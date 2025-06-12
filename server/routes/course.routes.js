import express from 'express';
import { getAllCourses, getLectureByCourseId, createCourse } from '../controllers/courses.controllers.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/').get(getAllCourses).post(createCourse);
router.route('/:courseId').get(isLoggedIn, getLectureByCourseId);

export default router;