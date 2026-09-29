const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, phone, fullName, full_name, age, state, district, village, profileImageUrl, profile_image_url } = req.body;

    if (!password) {
      return sendError(res, 'Password is required', 400);
    }
    if (!email && !phone) {
      return sendError(res, 'Either email or phone number is required', 400);
    }

    const result = await authService.registerUser({
      email,
      password,
      phone,
      full_name: full_name || fullName,
      age,
      state,
      district,
      village,
      profile_image_url: profile_image_url || profileImageUrl,
    });

    return sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { identifier, email, phone, password } = req.body;

    if (!password) {
      return sendError(res, 'Password is required', 400);
    }
    if (!identifier && !email && !phone) {
      return sendError(res, 'Email or phone number is required', 400);
    }

    const result = await authService.loginUser({
      identifier,
      email,
      phone,
      password,
    });

    return sendSuccess(res, result, 'User logged in successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Get current logged in user profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const profile = await authService.getProfileById(req.user.id);
    return sendSuccess(res, { user: profile }, 'Profile retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Update current logged in user profile
 * PUT /api/v1/auth/me
 */
const updateMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return sendError(res, 'Unauthorized', 401);
    }

    const updatedProfile = await authService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, { user: updatedProfile }, 'Profile updated successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * Logout
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, null, 'User logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  logout,
};
