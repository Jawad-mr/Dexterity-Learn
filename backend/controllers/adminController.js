import User from '../models/User.js';
import Course from '../models/Course.js';
import Book from '../models/Book.js';
import Payment from '../models/Payment.js';
import Certificate from '../models/Certificate.js';
import Announcement from '../models/Announcement.js';
import Category from '../models/Category.js';
import Lesson from '../models/Lesson.js';

// @desc    Get dashboard metrics & analytics charts
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    
    // Daily Active Users: users active in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dau = await User.countDocuments({ 'progress.lastActive': { $gte: oneDayAgo } });

    const totalCourses = await Course.countDocuments({});
    const totalBooks = await Book.countDocuments({});

    // Sales metrics
    const certificatesSold = await Payment.countDocuments({ productType: 'certificate', status: 'completed' });
    const booksSold = await Payment.countDocuments({ productType: 'book', status: 'completed' });

    // Revenue summation
    const completedPayments = await Payment.find({ status: 'completed' });
    const totalRevenue = completedPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // Recent user signups
    const recentSignups = await User.find({}).sort({ createdAt: -1 }).limit(5).select('username email createdAt profileImage');

    // Chart analytics (last 6 months revenue & signups breakdown)
    const salesGroup = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const usersGroup = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Popular Course calculation
    const courseStats = await User.aggregate([
      { $unwind: "$enrolledCourses" },
      {
        $group: {
          _id: "$enrolledCourses.courseId",
          enrolledCount: { $sum: 1 }
        }
      },
      { $sort: { enrolledCount: -1 } },
      { $limit: 1 }
    ]);
    let popularCourse = null;
    if (courseStats.length > 0) {
      popularCourse = await Course.findById(courseStats[0]._id).select('title shortDescription difficulty');
    }

    // Popular Book calculation
    const bookStats = await User.aggregate([
      { $unwind: "$readingHistory" },
      {
        $group: {
          _id: "$readingHistory.bookId",
          readersCount: { $sum: 1 }
        }
      },
      { $sort: { readersCount: -1 } },
      { $limit: 1 }
    ]);
    let popularBook = null;
    if (bookStats.length > 0) {
      popularBook = await Book.findById(bookStats[0]._id).select('title author coverImage');
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        dau,
        totalCourses,
        totalBooks,
        certificatesSold,
        booksSold,
        totalRevenue,
      },
      recentSignups,
      popularCourse,
      popularBook,
      charts: {
        salesGroup,
        usersGroup
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// USER CRUD CONTROLLERS
// ==========================================
export const adminGetUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUser = async (req, res, next) => {
  const { role, isVerified } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    await user.save();
    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COURSE CRUD CONTROLLERS
// ==========================================
export const adminCreateCourse = async (req, res, next) => {
  const { title, description, shortDescription, difficulty, estimatedTime, category, isDraft } = req.body;
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const course = await Course.create({
      title,
      slug,
      description,
      shortDescription,
      difficulty,
      estimatedTime,
      category,
      isDraft: isDraft !== undefined ? isDraft : true,
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) {
      res.status(404);
      return next(new Error('Course not found'));
    }
    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      return next(new Error('Course not found'));
    }
    // Delete associated lessons
    await Lesson.deleteMany({ courseId: course._id });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course and associated lessons deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LESSON CRUD & REORDER CONTROLLERS
// ==========================================
export const adminCreateLesson = async (req, res, next) => {
  const { courseId, title, content, codeSnippets, order } = req.body;
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const lesson = await Lesson.create({
      courseId,
      title,
      slug,
      content,
      codeSnippets,
      order: order || 0,
    });
    res.status(201).json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteLesson = async (req, res, next) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminReorderLessons = async (req, res, next) => {
  const { orderList } = req.body; // array of { id, order }
  try {
    const bulkOps = orderList.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { order: item.order },
      },
    }));
    await Lesson.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Lesson order updated successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BOOK CRUD CONTROLLERS
// ==========================================
export const adminCreateBook = async (req, res, next) => {
  const { title, description, coverImage, author, price, rating, pages } = req.body;
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const book = await Book.create({
      title,
      slug,
      description,
      coverImage,
      author,
      price,
      rating,
      pages: pages || [],
    });
    res.status(201).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteBook = async (req, res, next) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ANNOUNCEMENT CRUD CONTROLLERS
// ==========================================
export const adminCreateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, announcement });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, announcement });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CATEGORY CRUD CONTROLLERS
// ==========================================
export const adminCreateCategory = async (req, res, next) => {
  const { name, icon } = req.body;
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name, slug, icon });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PAYMENT APPROVAL & ACCESS GRANT CONTROLLERS
// ==========================================
export const adminGetPendingPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({})
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

export const adminApprovePayment = async (req, res, next) => {
  const { paymentId } = req.params;
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404);
      return next(new Error('Payment log record not found'));
    }

    payment.status = 'completed';
    payment.transactionId = `WA_ADMIN_${Date.now()}`;
    await payment.save();

    const user = await User.findById(payment.userId);
    if (user) {
      if (payment.productType === 'book' && payment.productId) {
        if (!user.unlockedBooks.includes(payment.productId)) {
          user.unlockedBooks.push(payment.productId);
          await user.save();
        }
      } else if (payment.productType === 'certificate' && payment.productId) {
        let cert = await Certificate.findOne({ userId: user._id, courseId: payment.productId });
        if (!cert) {
          cert = new Certificate({
            userId: user._id,
            courseId: payment.productId,
            certificateId: `CERT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            isPaid: true,
            issuedAt: Date.now(),
          });
        } else {
          cert.isPaid = true;
          cert.issuedAt = Date.now();
        }
        await cert.save();
      }
    }

    res.json({ success: true, message: 'Payment approved and access granted successfully!', payment });
  } catch (error) {
    next(error);
  }
};

export const adminGrantAccess = async (req, res, next) => {
  const { userId, targetType, targetId } = req.body; // targetType: 'certificate' | 'course' | 'book'
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (targetType === 'certificate') {
      let cert = await Certificate.findOne({ userId, courseId: targetId });
      if (!cert) {
        cert = new Certificate({
          userId,
          courseId: targetId,
          certificateId: `CERT-ADMIN-${Date.now()}`,
          isPaid: true,
          issuedAt: Date.now(),
        });
      } else {
        cert.isPaid = true;
        cert.issuedAt = Date.now();
      }
      await cert.save();
    } else if (targetType === 'book') {
      if (!user.unlockedBooks.includes(targetId)) {
        user.unlockedBooks.push(targetId);
        await user.save();
      }
    } else if (targetType === 'course') {
      const existing = user.enrolledCourses.find(c => c.courseId.toString() === targetId);
      if (existing) {
        existing.progress = 100;
      } else {
        user.enrolledCourses.push({ courseId: targetId, progress: 100, completedLessons: [] });
      }
      await user.save();
    }

    res.json({ success: true, message: `Granted ${targetType} access to ${user.username}` });
  } catch (error) {
    next(error);
  }
};
