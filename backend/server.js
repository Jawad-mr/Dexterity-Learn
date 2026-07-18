import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Config & Middleware
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize dotenv configuration
dotenv.config();

// Verify critical environment variables are present at startup
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`\n🚨 DEPLOYMENT WARNING: Missing required environment variables: ${missingEnvVars.join(', ')}\n`);
}

// Connect to Database
connectDB();

const app = express();

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// Enable Cross-Origin Resource Sharing (Trim trailing slashes to prevent CORS mismatches)
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrl = rawFrontendUrl.endsWith('/') ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

// Payload parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from local uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check and root message
app.get('/', (req, res) => {
  res.json({
    message: 'Dexterity Learn API is up and running!',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Route mappings
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

// Page Not Found handler
app.use(notFound);

// Global Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Capture unhandled promise rejections and uncaught exceptions to ensure graceful server termination
process.on('unhandledRejection', (err) => {
  console.error(`\n🚨 UNHANDLED REJECTION: ${err.name} - ${err.message}`);
  if (err.stack) console.error(err.stack);
  console.warn('Shutting down server gracefully...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error(`\n🚨 UNCAUGHT EXCEPTION: ${err.name} - ${err.message}`);
  if (err.stack) console.error(err.stack);
  console.warn('Shutting down server gracefully...');
  server.close(() => {
    process.exit(1);
  });
});
