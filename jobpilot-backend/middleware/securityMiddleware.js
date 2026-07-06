const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

/**
 * securityMiddleware
 *
 * Centralizes all HTTP-layer security hardening for the JobPilot API:
 *   - helmetMiddleware: secure HTTP headers (Helmet)
 *   - corsMiddleware: strict origin allowlist (CORS)
 *   - apiLimiter: general rate limit for all /api routes
 *   - authLimiter: stricter rate limit for brute-force-sensitive
 *     auth endpoints (login/register)
 *
 * Import and apply each piece in server.js. Keeping these together
 * (rather than scattered inline in server.js) makes the security
 * posture auditable in one place.
 */

// ── Helmet ───────────────────────────────────────────────────────
/**
 * Sets a strong baseline of security headers (X-Content-Type-Options,
 * X-Frame-Options, Strict-Transport-Security, etc). crossOriginResourcePolicy
 * is relaxed to 'cross-origin' since this is a pure JSON API consumed by a
 * separately-hosted frontend (CORS below is the real access-control layer).
 */
const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // No HTML is ever served by this API, so a restrictive CSP for JSON
  // responses isn't meaningful — Helmet's other defaults (HSTS, noSniff,
  // frameguard, hidePoweredBy, etc.) remain fully active.
  contentSecurityPolicy: false,
});

// ── CORS ─────────────────────────────────────────────────────────
/**
 * Builds the list of allowed origins from CLIENT_URL (supports a
 * comma-separated list for staging + production frontends sharing
 * one backend). Falls back to the local Vite dev server only when
 * CLIENT_URL is unset, so local development keeps working out of
 * the box without weakening the production allowlist.
 */
const buildAllowedOrigins = () => {
  if (!process.env.CLIENT_URL) {
    return ['http://localhost:3000', 'http://localhost:5173'];
  }

  return process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean);
};

const allowedOrigins = buildAllowedOrigins();

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (server-to-server calls,
    // curl, Postman, mobile apps) — these can't be CSRF'd via a browser.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const corsError = new Error(`CORS: Origin "${origin}" is not allowed`);
    corsError.statusCode = 403;
    return callback(corsError);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // cache preflight (OPTIONS) responses for 24h
});

// ── Rate Limiting ────────────────────────────────────────────────
/**
 * General API limiter — applied to all /api routes. Generous enough
 * for normal dashboard usage (polling stats, paginating tables) while
 * still blocking scraping/DoS-style abuse.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                 // 300 requests per IP per window
  standardHeaders: true,    // return RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in a few minutes.',
  },
});

/**
 * Strict limiter for authentication endpoints (POST /api/auth/login,
 * POST /api/auth/register) — these are the prime brute-force /
 * credential-stuffing targets, so they get a much tighter window.
 * Successful requests still count toward the limit (skipSuccessfulRequests
 * is intentionally left false) so a compromised credential can't be
 * brute-forced via repeated successful-looking attempts either.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  authLimiter,
  allowedOrigins,
};