const express = require('express');
const { register, login, getMe, updateMe, logout } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register user with email/phone, password, and unified profile
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user with email/phone and password
 * @access Public
 */
router.post('/login', login);

/**
 * @route GET /api/v1/auth/me
 * @desc Get currently authenticated user profile
 * @access Private
 */
router.get('/me', requireAuth, getMe);

/**
 * @route PUT /api/v1/auth/me
 * @desc Update currently authenticated user profile
 * @access Private
 */
router.put('/me', requireAuth, updateMe);

/**
 * @route POST /api/v1/auth/logout
 * @desc Sign out currently authenticated user
 * @access Private
 */
router.post('/logout', requireAuth, logout);

module.exports = router;
