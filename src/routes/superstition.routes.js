const express = require('express');
const { getAllSuperstitions, getSuperstitionById } = require('../controllers/superstition.controller');

const router = express.Router();

router.get('/', getAllSuperstitions);
router.get('/:id', getSuperstitionById);

module.exports = router;
