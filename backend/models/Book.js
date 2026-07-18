import mongoose from 'mongoose';

const bookPageSchema = new mongoose.Schema({
  pageNumber: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true, // Complete reading text for this page
  },
  readingTime: {
    type: String,
    default: '5 mins',
  },
});

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a book description'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      required: [true, 'Please specify the author name'],
    },
    price: {
      type: Number,
      default: 299, // price in INR, or $4.99 equivalent
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    pages: [bookPageSchema],
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', bookSchema);
export default Book;
