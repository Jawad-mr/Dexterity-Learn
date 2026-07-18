import express from 'express';
import {
  getCourses,
  getCourseBySlug,
  getLessonContent,
  toggleLessonComplete,
  toggleBookmark,
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:slug', getCourseBySlug);
router.get('/:courseSlug/lessons/:lessonSlug', getLessonContent);

// Protected routes
router.post('/:courseId/lessons/:lessonId/complete', protect, toggleLessonComplete);
router.post('/bookmarks', protect, toggleBookmark);

export default router;
