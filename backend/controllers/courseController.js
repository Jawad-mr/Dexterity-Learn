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

    const courses = await Course.find(query).sort({ createdAt: 1 });
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
    const course = await Course.findOne({ slug: req.params.slug, isDraft: false });
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
    const course = await Course.findOne({ slug: courseSlug, isDraft: false });
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
    const course = await Course.findById(courseId);
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

    // 2. Fetch user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // 3. Find if already enrolled
    let enrollment = user.enrolledCourses.find(
      (c) => c.courseId.toString() === courseId.toString()
    );

    if (!enrollment) {
      // Enroll user
      enrollment = {
        courseId,
        progress: 0,
        completedLessons: [lessonId],
      };
      user.enrolledCourses.push(enrollment);
      // Award XP for enrolling
      user.progress.xp += 20;
    } else {
      const lessonIndex = enrollment.completedLessons.indexOf(lessonId);

      if (lessonIndex > -1) {
        // Toggle: Unmark complete
        enrollment.completedLessons.splice(lessonIndex, 1);
      } else {
        // Toggle: Mark complete
        enrollment.completedLessons.push(lessonId);
        // Award completion XP
        user.progress.xp += 10;
      }
    }

    // 4. Calculate progress percentage
    const completedCount = enrollment.completedLessons.length;
    enrollment.progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    enrollment.updatedAt = Date.now();

    // 5. Check if course reached 100% and issue locked certificate
    if (enrollment.progress === 100) {
      const certExists = await Certificate.findOne({ userId, courseId });
      if (!certExists) {
        const certificateId = crypto.randomBytes(16).toString('hex');
        await Certificate.create({
          userId,
          courseId,
          userName: user.username,
          courseTitle: course.title,
          certificateId,
          isPaid: false, // Locked until payment
        });
        // Award course completion badge
        if (!user.progress.badges.includes('Course Graduate')) {
          user.progress.badges.push('Course Graduate');
        }
        user.progress.xp += 100;
      }
    }

    await user.save();

    res.json({
      success: true,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
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
