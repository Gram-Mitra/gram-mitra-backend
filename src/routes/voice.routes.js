const express = require('express');
const {
  getMentorSession,
  getVoiceConfig,
  handleVapiWebhook,
  getCallLogs,
  processVoiceQuery,
} = require('../controllers/voice.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Voice Agent & AI Mentor Routes Hierarchy:
 *
 * Voice (/api/v1/voice)
 * ├── POST /session  - Initialize mentor voice call session (Vapi Web SDK)
 * ├── GET  /config   - Get available mentor profiles and Vapi configuration
 * ├── POST /webhook  - Vapi server webhook (tool-calls & end-of-call-report)
 * ├── GET  /logs     - View call history and summaries
 * └── POST /query    - Legacy text-to-voice query handler
 */

// Mentor Call Session & Config
router.post('/session', optionalAuth, getMentorSession);
router.get('/config', optionalAuth, getVoiceConfig);

// Vapi Webhook (Called by Vapi cloud during and after calls)
router.post('/webhook', handleVapiWebhook);

// Call logs / history
router.get('/logs', optionalAuth, getCallLogs);

// Legacy query route
router.post('/query', processVoiceQuery);

module.exports = router;
