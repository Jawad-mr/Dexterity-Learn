import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  answerIndex: {
    type: Number,
    required: true, // index (0, 1, 2...)
  },
  explanation: {
    type: String,
    default: '',
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
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
      required: [true, 'Please provide a detailed course description'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a short description for cards'],
      maxlength: [200, 'Short description cannot be more than 200 characters'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    estimatedTime: {
      type: String,
      required: [true, 'Please specify estimated reading/completion time'], // e.g. "4 hours"
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
    },
    image: {
      type: String,
      default: '',
    },
    certificatePrice: {
      type: Number,
      default: 499, // price in INR, or $9.99 equivalent
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    quizzes: [quizSchema],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
