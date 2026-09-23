const express = require('express');
const {
  getSchemes,
  getSchemesCatalog,
  getSchemeStats,
  getSchemeById,
  getNgos,
} = require('../controllers/scheme.controller');

const router = express.Router();

// Specific routes first
router.get('/catalog', getSchemesCatalog);
router.get('/stats', getSchemeStats);
router.get('/ngos', getNgos);

// Root schemes endpoint (fetches live data from data.gov.in)
router.get('/', getSchemes);

// Parameterized route
router.get('/:id', getSchemeById);

module.exports = router;
