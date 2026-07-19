import mongoose from 'mongoose';

// Set up connection event listeners for production stability monitoring
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost! Retrying...');
});

mongoose.connection.on('error', (err) => {
  console.error(`🚨 MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('connected', () => {
  console.log('💚 MongoDB connection established successfully.');
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6 (more stable on cloud environments)
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
