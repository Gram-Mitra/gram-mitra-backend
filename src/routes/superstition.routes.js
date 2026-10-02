const express = require('express');
const {
  getAllSuperstitions,
  getCategories,
  getStats,
  getRandomSuperstition,
  getSuperstitionById,
  createSuperstition,
  updateSuperstition,
  deleteSuperstition,
  verifySuperstition,
} = require('../controllers/superstition.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Superstition / Myth vs Fact Routes Hierarchy:
 *
 * Superstition / Myth (/api/v1/superstitions and /api/v1/myths)
 * └── Myth vs Fact
 *     ├── GET    /categories   - Available myth categories with item counts
 *     ├── GET    /stats        - Aggregate metrics (total myths, verified, languages)
 *     ├── GET    /random       - Random / Myth of the Day entry
 *     ├── GET    /             - List myths (filters: category, language, search, verified, pagination)
 *     ├── POST   /             - Submit a new myth vs fact entry
 *     ├── GET    /:id          - Retrieve single myth vs fact by UUID
 *     ├── PUT    /:id          - Update existing myth vs fact entry
 *     ├── DELETE /:id          - Delete myth vs fact entry
 *     └── PATCH  /:id/verify   - Verify entry with authority citation
 */

// 1. Static endpoints (placed before /:id to prevent route collision)
router.get('/categories', getCategories);
router.get('/stats', getStats);
router.get('/random', getRandomSuperstition);

// 2. Collection endpoints
router.get('/', getAllSuperstitions);
router.post('/', optionalAuth, createSuperstition);

// 3. Single Item endpoints
router.get('/:id', getSuperstitionById);
router.put('/:id', optionalAuth, updateSuperstition);
router.delete('/:id', optionalAuth, deleteSuperstition);
router.patch('/:id/verify', optionalAuth, verifySuperstition);

module.exports = router;
