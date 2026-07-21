import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAdminStats,
  adminGetUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
  adminCreateLesson,
  adminUpdateLesson,
  adminDeleteLesson,
  adminReorderLessons,
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminDeleteAnnouncement,
  adminCreateCategory,
  adminDeleteCategory,
  adminGetPendingPayments,
  adminApprovePayment,
  adminGrantAccess,
  adminSeedDatabase,
} from '../controllers/adminController.js';
import { adminCreateCourseValidator, adminUpdateCourseValidator } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Secure all admin routes with authentication and role-checking
router.use(protect);
router.use(admin);

// Dashboard metrics
router.get('/stats', getAdminStats);
router.post('/seed-db', adminSeedDatabase);

// Payments & Access Grants
router.get('/payments', adminGetPendingPayments);
router.post('/payments/approve/:paymentId', adminApprovePayment);
router.post('/grant-access', adminGrantAccess);

// User management
router.get('/users', adminGetUsers);
router.put('/users/:id', adminUpdateUser);
router.delete('/users/:id', adminDeleteUser);

// Course management
router.post('/courses', adminCreateCourseValidator, adminCreateCourse);
router.put('/courses/:id', adminUpdateCourseValidator, adminUpdateCourse);
router.delete('/courses/:id', adminDeleteCourse);

// Lesson management
router.post('/lessons', adminCreateLesson);
router.put('/lessons/:id', adminUpdateLesson);
router.delete('/lessons/:id', adminDeleteLesson);
router.post('/lessons/reorder', adminReorderLessons);

// Book management
router.post('/books', adminCreateBook);
router.put('/books/:id', adminUpdateBook);
router.delete('/books/:id', adminDeleteBook);

// Announcement management
router.post('/announcements', adminCreateAnnouncement);
router.put('/announcements/:id', adminUpdateAnnouncement);
router.delete('/announcements/:id', adminDeleteAnnouncement);

// Category management
router.post('/categories', adminCreateCategory);
router.delete('/categories/:id', adminDeleteCategory);

export default router;
