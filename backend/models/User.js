import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profileImage: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        progress: {
          type: Number,
          default: 0, // percentage 0 to 100
        },
        completedLessons: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
          },
        ],
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    unlockedBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    progress: {
      xp: {
        type: Number,
        default: 0,
      },
      streak: {
        type: Number,
        default: 0,
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
      badges: [
        {
          type: String,
        },
      ],
    },
    readingHistory: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        lastReadPage: {
          type: Number,
          default: 1,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bookmarks: [
      {
        type: {
          type: String,
          enum: ['lesson', 'book'],
          required: true,
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
