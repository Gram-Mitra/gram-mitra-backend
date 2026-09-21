const express = require('express');
const { getNearbyFacilities, getFacilityById } = require('../controllers/healthcare.controller');

const router = express.Router();

router.get('/', getNearbyFacilities);
router.get('/:id', getFacilityById);

module.exports = router;
