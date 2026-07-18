import crypto from 'crypto';
import fs from 'fs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { transporter } from '../config/nodemailer.js';
import { cloudinary, isConfigured as isCloudinaryConfigured } from '../config/cloudinary.js';

// Helper to send emails
const sendEmailHelper = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Dexterity Learn <noreply@dexteritylearn.com>',
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email or username'));
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 3600 * 1000; // 24 hours

    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
    });

    if (user) {
      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/verify-email?token=${verificationToken}`;
      const emailText = `Welcome to Dexterity Learn, ${username}!\n\nPlease verify your email by clicking: ${verificationUrl}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0d9488; text-align: center;">Welcome to Dexterity Learn!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for signing up. Please verify your email address to unlock your account and start coding.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center;">If you did not request this email, please ignore it.</p>
        </div>
      `;

      await sendEmailHelper(email, 'Verify Your Email — Dexterity Learn', emailText, emailHtml);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data provided'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      return next(new Error('Invalid or expired verification token'));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    // Grant starting XP and badge for signing up
    user.progress.xp += 100;
    user.progress.badges.push('Code Novice');

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user and include select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // Check if verified
    if (!user.isVerified) {
      res.status(403);
      return next(new Error('Please verify your email address before logging in.'));
    }

    // Calculate daily streak
    const today = new Date();
    const lastActiveDate = new Date(user.progress.lastActive);
    const dayDifference = Math.floor((today - lastActiveDate) / (1000 * 3600 * 24));

    if (dayDifference === 1) {
      user.progress.streak += 1;
    } else if (dayDifference > 1) {
      user.progress.streak = 1; // reset streak
    } else if (user.progress.streak === 0) {
      user.progress.streak = 1;
    }
    user.progress.lastActive = today;
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        progress: user.progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      return next(new Error('User not found with this email address'));
    }

    // Create password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/reset-password?token=${resetToken}`;
    const emailText = `You requested a password reset.\n\nPlease reset your password by clicking: ${resetUrl}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0d9488; text-align: center;">Reset Your Password</h2>
        <p>Hi ${user.username},</p>
        <p>We received a request to reset your password. Click the button below to secure a new password. This link will expire in 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px; text-align: center;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    await sendEmailHelper(email, 'Reset Password Request — Dexterity Learn', emailText, emailHtml);

    res.json({
      success: true,
      message: 'Password reset link sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      return next(new Error('Invalid or expired reset password token'));
    }

    user.password = password; // pre-save hashes this
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset completed! You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.courseId')
      .populate('unlockedBooks')
      .populate('readingHistory.bookId');

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  const { username } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        res.status(400);
        return next(new Error('Username is already taken'));
      }
      user.username = username;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        progress: user.progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile image
// @route   POST /api/auth/profile/image
// @access  Private
export const uploadProfileImage = async (req, res, next) => {
  if (!req.file) {
    res.status(400);
    return next(new Error('Please upload an image file'));
  }

  const filePath = req.file.path;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      // Clean up file if user doesn't exist
      fs.unlinkSync(filePath);
      res.status(404);
      return next(new Error('User not found'));
    }

    let imageUrl = '';

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'dexterity-learn/profiles',
        width: 150,
        height: 150,
        crop: 'fill',
      });
      imageUrl = result.secure_url;
      // Remove temporary file
      fs.unlinkSync(filePath);
    } else {
      // In development mode without Cloudinary, mock upload url
      // Move temporary file to custom backend asset directory or simulate
      imageUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`;
      fs.unlinkSync(filePath); // delete local temporary uploaded file
    }

    user.profileImage = imageUrl;
    await user.save();

    res.json({
      success: true,
      profileImage: imageUrl,
    });
  } catch (error) {
    // Delete temp file if error occurs
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Verify current password
    if (!(await user.comparePassword(currentPassword))) {
      res.status(400);
      return next(new Error('Incorrect current password'));
    }

    user.password = newPassword; // pre-save will hash this
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    next(error);
  }
};
