const express = require('express');
const {
  getNgos,
  getNgoById,
  createNgo,
  updateNgo,
  deleteNgo,
  getCategories,
  getStats,
} = require('../controllers/ngo.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * NGOs API Routes Hierarchy:
 *
 * NGOs (/api/v1/ngos)
 * └── NGO Information
 *     ├── GET    /            - List partner NGOs (filters: category, district, state, village, service, search, lat, lng, radius)
 *     ├── GET    /categories  - List NGO categories and distribution
 *     ├── GET    /stats       - High-level statistics on NGO network coverage
 *     ├── GET    /:id         - Detailed NGO profile (contacts, location, services)
 *     ├── POST   /            - Register a new NGO
 *     ├── PUT    /:id         - Update NGO information
 *     └── DELETE /:id         - Deactivate or delete NGO
 */

// 1. Static endpoints (placed before :id to prevent collision)
router.get('/categories', getCategories);
router.get('/stats', getStats);

// 2. Collection endpoints
router.get('/', getNgos);
router.post('/', optionalAuth, createNgo);

// 3. Item endpoints
router.get('/:id', getNgoById);
router.put('/:id', optionalAuth, updateNgo);
router.delete('/:id', optionalAuth, deleteNgo);

module.exports = router;
