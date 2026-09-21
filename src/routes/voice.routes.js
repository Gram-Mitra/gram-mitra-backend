const express = require('express');
const { processVoiceQuery } = require('../controllers/voice.controller');

const router = express.Router();

router.post('/query', processVoiceQuery);

module.exports = router;
