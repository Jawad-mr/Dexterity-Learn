import express from 'express';
import {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/verify-email', verifyEmail);
router.post('/login', loginValidator, login);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/image', protect, upload.single('image'), uploadProfileImage);
router.put('/change-password', protect, changePassword);

export default router;
