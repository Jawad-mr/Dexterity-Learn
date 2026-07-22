import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Read JWT from header or cookies if implemented
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token, excluding password
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found with this token' });
    }

    // Recalculate streak and update lastActive dynamically on calendar day change
    const today = new Date();
    const lastActiveDate = new Date(user.progress?.lastActive || today);
    
    // Normalize dates to midnight to compute calendar day difference
    const date1 = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
    const date2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const calDiff = Math.round((date2 - date1) / (1000 * 3600 * 24));

    let updated = false;

    if (user.progress) {
      if (calDiff === 1) {
        user.progress.streak += 1;
        user.progress.lastActive = today;
        updated = true;
      } else if (calDiff > 1) {
        user.progress.streak = 1;
        user.progress.lastActive = today;
        updated = true;
      } else if (user.progress.streak === 0) {
        user.progress.streak = 1;
        user.progress.lastActive = today;
        updated = true;
      } else if (calDiff === 0 && user.progress.lastActive.toDateString() !== today.toDateString()) {
        // First request of calendar day but within 24h
        user.progress.lastActive = today;
        updated = true;
      }
    }

    if (updated) {
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Auth token error: ${error.message}`);
    return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied, administrator role required' });
  }
};
