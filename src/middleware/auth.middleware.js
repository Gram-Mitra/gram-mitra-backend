const { supabase, supabaseAdmin } = require('../config/supabase');
const { sendError } = require('../utils/response');
const { TABLES } = require('../config/supabase');

/**
 * Authentication Middleware
 * Validates Supabase JWT access token from the Authorization header
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Access token is required', 401);
    }

    const client = supabaseAdmin || supabase;
    const { data: { user }, error } = await client.auth.getUser(token);

    if (error || !user) {
      return sendError(res, 'Invalid, expired, or revoked token', 401, error ? error.message : null);
    }

    // Fetch user profile from the profiles table
    const { data: profile } = await client
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = user;
    req.profile = profile || null;
    req.token = token;

    next();
  } catch (err) {
    return sendError(res, 'Authentication failed', 401, err.message);
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user and profile if valid token is provided, continues if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const client = supabaseAdmin || supabase;
    const { data: { user } } = await client.auth.getUser(token);

    if (user) {
      const { data: profile } = await client
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', user.id)
        .single();

      req.user = user;
      req.profile = profile || null;
      req.token = token;
    }

    next();
  } catch (err) {
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};
