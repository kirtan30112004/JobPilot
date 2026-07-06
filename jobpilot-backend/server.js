const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load environment variables before anything else touches process.env
dotenv.config();

const validateEnv = require('./config/envValidator');
const connectDB = require('./config/db');
const {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  authLimiter,
} = require('./middleware/securityMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const companyRoutes = require('./routes/companyRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// ── Fail fast on missing/weak configuration ─────────────────────
// Must run before connectDB() — there's no point opening a DB
// connection if JWT_SECRET is a placeholder and every authenticated
// request would be insecure anyway.
try {
  validateEnv();
} catch (err) {
  console.error(`[startup] Environment validation failed: ${err.message}`);
  process.exit(1);
}

// ── Connect to MongoDB ───────────────────────────────────────────
connectDB();

const app = express();

// Trust the first proxy hop (Render/Heroku/Nginx/etc). Required for
// express-rate-limit and secure cookies to correctly identify the
// real client IP and protocol behind a reverse proxy.
app.set('trust proxy', 1);

// ── Security middleware (applied before any route or body parsing) ─
app.use(helmetMiddleware);
app.use(corsMiddleware);

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // cap payload size to mitigate large-body DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── General rate limiting for all API routes ────────────────────
app.use('/api', apiLimiter);

// ── Health check route (unauthenticated, lightweight) ────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'JobPilot API is running',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ─────────────────────────────────────────────────────
// Stricter rate limit applied only to the brute-force-sensitive auth
// endpoints, layered on top of the general /api limiter above.
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Error Handling Middleware (must be after routes) ──────────────
app.use(notFound);
app.use(errorHandler);

const PORT = Number.isInteger(parseInt(process.env.PORT, 10)) ? parseInt(process.env.PORT, 10) : 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// ── Graceful shutdown & unhandled rejection safety net ────────────
// Prevents the process from dying silently on an unawaited promise
// rejection (e.g. a missed .catch on a DB call) — log it and exit
// cleanly so a process manager (PM2/Docker/systemd) can restart it.
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;