const express = require('express');
const { getSchemes, getSchemeById, getNgos } = require('../controllers/scheme.controller');

const router = express.Router();

router.get('/', getSchemes);
router.get('/ngos', getNgos);
router.get('/:id', getSchemeById);

module.exports = router;
