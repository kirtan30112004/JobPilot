/**
 * envValidator
 *
 * Validates required environment variables at process startup so the
 * server fails fast with a clear error message instead of crashing
 * later (or worse, running silently insecure) when a variable is
 * missing or malformed.
 *
 * Call validateEnv() as the very first thing in server.js, before
 * connectDB() or any route is mounted.
 */

const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];

const VALID_NODE_ENVS = ['development', 'production', 'test'];

/**
 * Returns true if the given JWT secret is strong enough for
 * production use. Anthropic/industry guidance: at least 32
 * characters of entropy for HMAC-signed JWTs.
 */
const isStrongSecret = (secret) => typeof secret === 'string' && secret.length >= 32;

/**
 * Known placeholder values that indicate a .env.example was copied
 * but never actually filled in. Catches the single most common
 * "production deployed with example secrets" mistake.
 */
const PLACEHOLDER_PATTERNS = [
  /^your_/i,
  /^change_?this/i,
  /^replace_?me/i,
  /^example/i,
  /^<.*>$/,
];

const looksLikePlaceholder = (value) =>
  PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));

/**
 * Validates all required environment variables. Throws (and the
 * caller is expected to log + process.exit(1)) on any hard failure:
 *   - a required variable is missing or empty
 *   - JWT_SECRET is a known placeholder string
 *   - NODE_ENV is set to something other than the three valid values
 *
 * Emits console.warn (non-fatal) for softer issues that are allowed
 * in development but should be fixed before shipping:
 *   - JWT_SECRET shorter than 32 characters
 *   - PORT is not a valid number
 *   - CLIENT_URL is missing (CORS will fall back to a dev default)
 */
function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key] || process.env[key].trim() === '');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill in real values before starting the server.'
    );
  }

  if (looksLikePlaceholder(process.env.JWT_SECRET)) {
    throw new Error(
      'JWT_SECRET appears to be an unfilled placeholder value (e.g. "your_secret_here"). ' +
      'Generate a strong random secret before starting the server.'
    );
  }

  if (process.env.NODE_ENV && !VALID_NODE_ENVS.includes(process.env.NODE_ENV)) {
    throw new Error(
      `Invalid NODE_ENV: "${process.env.NODE_ENV}". Must be one of: ${VALID_NODE_ENVS.join(', ')}.`
    );
  }

  // ── Non-fatal warnings ──────────────────────────────────────
  if (!isStrongSecret(process.env.JWT_SECRET)) {
    console.warn(
      '[envValidator] WARNING: JWT_SECRET is shorter than the recommended 32 characters. ' +
      'This is acceptable for local development but should be strengthened before production.'
    );
  }

  if (process.env.PORT && Number.isNaN(parseInt(process.env.PORT, 10))) {
    console.warn(`[envValidator] WARNING: PORT="${process.env.PORT}" is not a valid number. Falling back to 5000.`);
  }

  if (!process.env.CLIENT_URL) {
    console.warn(
      '[envValidator] WARNING: CLIENT_URL is not set. CORS will fall back to http://localhost:3000, ' +
      'which will reject requests from a deployed frontend.'
    );
  }

  if (process.env.NODE_ENV === 'production' && isStrongSecret(process.env.JWT_SECRET) === false) {
    console.warn(
      '[envValidator] WARNING: Running in production with a weak JWT_SECRET (< 32 characters). ' +
      'Rotate this secret immediately.'
    );
  }

  console.log('[envValidator] Environment validation passed.');
}

module.exports = validateEnv;