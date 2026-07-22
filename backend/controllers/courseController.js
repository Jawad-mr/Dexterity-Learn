import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';
import crypto from 'crypto';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  const { category, difficulty, search } = req.query;

  try {
    const query = { isDraft: false };

    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).select('-quizzes -description').sort({ createdAt: 1 });
    res.json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course by slug (includes lessons directory)
// @route   GET /api/courses/:slug
// @access  Public
export const getCourseBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    let isEnrolled = false;

    // Check optional token to allow enrolled/admin draft bypass
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          if (user.role === 'admin') {
            isEnrolled = true;
          } else {
            const courseObj = await Course.findOne({ slug });
            if (courseObj) {
              isEnrolled = user.enrolledCourses.some(
                (c) => c.courseId.toString() === courseObj._id.toString()
              );
            }
          }
        }
      } catch (err) {
        // ignore invalid token
      }
    }

    const query = { slug };
    if (!isEnrolled) {
      query.isDraft = false;
    }

    const course = await Course.findOne(query);
    if (!course) {
      res.status(404);
      return next(new Error('Course not found'));
    }

    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });

    res.json({
      success: true,
      course,
      lessons: lessons.map((l) => ({
        _id: l._id,
        title: l.title,
        slug: l.slug,
        order: l.order,
        estimatedTime: l.estimatedTime || '15 mins',
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lesson content
// @route   GET /api/courses/:courseSlug/lessons/:lessonSlug
// @access  Public (Reading is free)
export const getLessonContent = async (req, res, next) => {
  const { courseSlug, lessonSlug } = req.params;

  try {
    let isEnrolled = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          if (user.role === 'admin') {
            isEnrolled = true;
          } else {
            const courseObj = await Course.findOne({ slug: courseSlug });
            if (courseObj) {
              isEnrolled = user.enrolledCourses.some(
                (c) => c.courseId.toString() === courseObj._id.toString()
              );
            }
          }
        }
      } catch (err) {
        // ignore invalid token
      }
    }

    const query = { slug: courseSlug };
    if (!isEnrolled) {
      query.isDraft = false;
    }

    const course = await Course.findOne(query);
    if (!course) {
      res.status(404);
      return next(new Error('Course not found'));
    }

    const lesson = await Lesson.findOne({ courseId: course._id, slug: lessonSlug });
    if (!lesson) {
      res.status(404);
      return next(new Error('Lesson not found'));
    }

    // Get previous and next lessons for navigation
    const allLessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });
    const currentIndex = allLessons.findIndex((l) => l._id.toString() === lesson._id.toString());

    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    res.json({
      success: true,
      lesson,
      prevLesson: prevLesson ? { slug: prevLesson.slug, title: prevLesson.title } : null,
      nextLesson: nextLesson ? { slug: nextLesson.slug, title: nextLesson.title } : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle lesson complete / progress tracker
// @route   POST /api/courses/:courseId/lessons/:lessonId/complete
// @access  Private
export const toggleLessonComplete = async (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const userId = req.user._id;

  try {
    // 1. Verify course & lesson
    const course = await Course.findById(courseId).select('title');
    if (!course) {
      res.status(404);
      return next(new Error('Course not found'));
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      res.status(404);
      return next(new Error('Lesson does not belong to this course'));
    }

    const totalLessons = await Lesson.countDocuments({ courseId });

    // 2. Fetch user to check enrollment
    let user = await User.findById(userId);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // 3. Find if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      (c) => c.courseId.toString() === courseId.toString()
    );

    if (!alreadyEnrolled) {
      // Enroll user atomically
      user = await User.findOneAndUpdate(
        { _id: userId, 'enrolledCourses.courseId': { $ne: courseId } },
        {
          $push: {
            enrolledCourses: {
              courseId,
              progress: totalLessons > 0 ? Math.round((1 / totalLessons) * 100) : 0,
              completedLessons: [lessonId],
              updatedAt: new Date(),
            },
          },
          $inc: { 'progress.xp': 20 },
        },
        { new: true }
      );
    } else {
      const enrollment = user.enrolledCourses.find(
        (c) => c.courseId.toString() === courseId.toString()
      );
      const isCompleted = enrollment.completedLessons.some(
        (id) => id.toString() === lessonId.toString()
      );

      if (isCompleted) {
        // Toggle: Unmark complete
        user = await User.findOneAndUpdate(
          { _id: userId, 'enrolledCourses.courseId': courseId },
          {
            $pull: { 'enrolledCourses.$.completedLessons': lessonId },
          },
          { new: true }
        );
      } else {
        // Toggle: Mark complete
        user = await User.findOneAndUpdate(
          { _id: userId, 'enrolledCourses.courseId': courseId },
          {
            $addToSet: { 'enrolledCourses.$.completedLessons': lessonId },
            $inc: { 'progress.xp': 10 },
          },
          { new: true }
        );
      }
    }

    // Recalculate progress percentage from the updated user document
    const updatedEnrollment = user.enrolledCourses.find(
      (c) => c.courseId.toString() === courseId.toString()
    );
    const completedCount = updatedEnrollment.completedLessons.length;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    user = await User.findOneAndUpdate(
      { _id: userId, 'enrolledCourses.courseId': courseId },
      {
        $set: {
          'enrolledCourses.$.progress': progress,
          'enrolledCourses.$.updatedAt': new Date(),
        },
      },
      { new: true }
    );

    // 5. Check if course reached 100% and issue locked certificate
    if (progress === 100) {
      const certExists = await Certificate.findOne({ userId, courseId });
      if (!certExists) {
        const certificateId = crypto.randomUUID();
        await Certificate.create({
          userId,
          courseId,
          userName: user.fullName || user.username,
          courseTitle: course.title,
          certificateId,
          isPaid: false, // Locked until payment
        });
        // Award course completion badge atomically
        user = await User.findOneAndUpdate(
          { _id: userId },
          {
            $addToSet: { 'progress.badges': 'Course Graduate' },
            $inc: { 'progress.xp': 100 },
          },
          { new: true }
        );
      }
    }

    const finalEnrollment = user.enrolledCourses.find(
      (c) => c.courseId.toString() === courseId.toString()
    );

    res.json({
      success: true,
      progress: finalEnrollment.progress,
      completedLessons: finalEnrollment.completedLessons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark a lesson
// @route   POST /api/courses/bookmarks
// @access  Private
export const toggleBookmark = async (req, res, next) => {
  const { type, id, title, url } = req.body; // type: 'lesson' | 'book'

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const bookmarkIndex = user.bookmarks.findIndex(
      (b) => b.id.toString() === id.toString() && b.type === type
    );

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarks.splice(bookmarkIndex, 1);
      await user.save();
      return res.json({ success: true, message: 'Bookmark removed', bookmarked: false });
    } else {
      // Add bookmark
      user.bookmarks.push({ type, id, title, url });
      await user.save();
      return res.json({ success: true, message: 'Bookmark added', bookmarked: true });
    }
  } catch (error) {
    next(error);
  }
};
