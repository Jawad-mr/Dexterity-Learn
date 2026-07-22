import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Book from '../models/Book.js';
import Category from '../models/Category.js';

// @desc    Global search across courses, lessons, books, and categories
// @route   GET /api/search
// @access  Public
export const globalSearch = async (req, res, next) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return res.json({
      success: true,
      courses: [],
      lessons: [],
      books: [],
      categories: [],
    });
  }

  try {
    const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const searchRegex = new RegExp(escapedQuery, 'i');

    // 1. Search Courses
    const courses = await Course.find({
      isDraft: false,
      $or: [{ title: searchRegex }, { description: searchRegex }, { shortDescription: searchRegex }],
    }).limit(5);

    // 2. Search Lessons
    const lessons = await Lesson.find({
      $or: [{ title: searchRegex }, { content: searchRegex }],
    })
      .populate({
        path: 'courseId',
        match: { isDraft: false },
      })
      .limit(5);

    // Filter out lessons from draft courses
    const filteredLessons = lessons.filter((l) => l.courseId !== null);

    // 3. Search Books
    const books = await Book.find({
      $or: [{ title: searchRegex }, { description: searchRegex }, { author: searchRegex }],
    })
      .select('-pages')
      .limit(5);

    // 4. Search Categories
    const categories = await Category.find({
      name: searchRegex,
    }).limit(5);

    res.json({
      success: true,
      courses,
      lessons: filteredLessons.map((l) => ({
        _id: l._id,
        title: l.title,
        slug: l.slug,
        courseSlug: l.courseId?.slug,
        courseTitle: l.courseId?.title,
      })),
      books,
      categories,
    });
  } catch (error) {
    next(error);
  }
};
