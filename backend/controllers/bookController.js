import Book from '../models/Book.js';
import User from '../models/User.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res, next) => {
  try {
    const books = await Book.find({}).select('-pages'); // Exclude heavy page data for list catalog
    res.json({ success: true, books });
  } catch (error) {
    next(error);
  }
};

// @desc    Get book metadata (excludes pages text)
// @route   GET /api/books/:slug
// @access  Public
export const getBookBySlug = async (req, res, next) => {
  try {
    const book = await Book.findOne({ slug: req.params.slug }).select('-pages');
    if (!book) {
      res.status(404);
      return next(new Error('Book not found'));
    }

    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Get book page (enforces paywall)
// @route   GET /api/books/:slug/pages/:pageNumber
// @access  Public / Private (enforced dynamically)
export const getBookPage = async (req, res, next) => {
  const { slug, pageNumber } = req.params;
  const pageNum = parseInt(pageNumber);

  try {
    const book = await Book.findOne({ slug });
    if (!book) {
      res.status(404);
      return next(new Error('Book not found'));
    }

    const page = book.pages.find((p) => p.pageNumber === pageNum);
    if (!page) {
      res.status(404);
      return next(new Error(`Page ${pageNum} not found in this book.`));
    }

    let isLocked = false;

    // Check if the page is beyond the free limit (first 3 pages are free)
    if (pageNum > 3) {
      isLocked = true;

      // If user has JWT, check unlock status
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(' ')[1];
        try {
          const jwt = (await import('jsonwebtoken')).default;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id);

          if (user && (user.unlockedBooks.includes(book._id) || user.role === 'admin')) {
            isLocked = false;

            // Track reading history and award reading XP (+5 XP)
            const historyIndex = user.readingHistory.findIndex((h) => h.bookId.toString() === book._id.toString());
            if (historyIndex > -1) {
              user.readingHistory[historyIndex].lastReadPage = pageNum;
              user.readingHistory[historyIndex].updatedAt = Date.now();
            } else {
              user.readingHistory.push({ bookId: book._id, lastReadPage: pageNum });
              user.progress.xp += 15;
            }
            await user.save();
          }
        } catch (jwtError) {
          // Token invalid, keep page locked
          console.warn("Invalid token during book page read validation");
        }
      }
    } else {
      // Free pages - if user is logged in, still track history
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(' ')[1];
        try {
          const jwt = (await import('jsonwebtoken')).default;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id);
          if (user) {
            const historyIndex = user.readingHistory.findIndex((h) => h.bookId.toString() === book._id.toString());
            if (historyIndex > -1) {
              user.readingHistory[historyIndex].lastReadPage = pageNum;
              user.readingHistory[historyIndex].updatedAt = Date.now();
            } else {
              user.readingHistory.push({ bookId: book._id, lastReadPage: pageNum });
            }
            await user.save();
          }
        } catch (e) {}
      }
    }

    if (isLocked) {
      // Blur content: send a blurred excerpt and lock flag
      const contentExcerpt = page.content.slice(0, 150) + '...';
      return res.json({
        success: true,
        pageNumber: pageNum,
        isLocked: true,
        price: book.price,
        bookId: book._id,
        content: contentExcerpt,
        message: 'This page is locked. Unlock this book to continue reading.',
      });
    }

    res.json({
      success: true,
      pageNumber: pageNum,
      isLocked: false,
      content: page.content,
      readingTime: page.readingTime,
      totalPages: book.pages.length,
    });
  } catch (error) {
    next(error);
  }
};
