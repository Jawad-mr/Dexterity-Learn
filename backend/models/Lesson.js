import mongoose from 'mongoose';

const codeSnippetSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true, // e.g. "javascript", "python", "css"
  },
  code: {
    type: String,
    required: true,
  },
});

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a lesson title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide lesson markdown/HTML content'],
    },
    codeSnippets: [codeSnippetSchema],
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index so a course slug remains clean per course
lessonSchema.index({ courseId: 1, slug: 1 }, { unique: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
