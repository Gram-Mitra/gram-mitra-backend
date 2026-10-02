const config = require('../config');
const { sendSuccess, sendError } = require('../utils/response');
const voiceService = require('../services/voice.service');
const logger = require('../utils/logger');

/**
 * Voice Agent & AI Mentor Controller
 * Connects frontend "Call Mentor" button with Vapi.ai real-time voice sessions
 */

/**
 * POST /api/v1/voice/session
 * Generate session configuration and personalized variables for Vapi Web SDK
 */
const getMentorSession = async (req, res, next) => {
  try {
    const { mentorType, language } = req.body;
    const user = req.profile || req.user || null;

    const session = await voiceService.getMentorSession({
      user,
      mentorType,
      language,
    });

    return sendSuccess(res, session, 'Mentor voice session created successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/voice/config
 * Retrieve Vapi agent configuration and available mentor profiles
 */
const getVoiceConfig = async (req, res, next) => {
  try {
    const user = req.profile || req.user || null;
    const mentorType = req.query.mentorType || 'krishi_mentor';
    const language = req.query.language || 'hi';

    const session = await voiceService.getMentorSession({
      user,
      mentorType,
      language,
    });

    return sendSuccess(res, session, 'Voice mentor configuration retrieved', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/voice/webhook
 * Handles Vapi events during live call:
 * - 'tool-calls': Dynamic queries to Gram Mitra backend (Myths, Schemes, Hospitals, Problems)
 * - 'end-of-call-report': Call recording, transcript, and summary
 */
const handleVapiWebhook = async (req, res, next) => {
  try {
    // Optional secret verification if VAPI_SERVER_SECRET is configured
    if (config.vapi.serverSecret) {
      const incomingSecret =
        req.headers['x-vapi-secret'] ||
        req.headers['authorization']?.replace('Bearer ', '') ||
        req.query.secret;

      if (incomingSecret && incomingSecret !== config.vapi.serverSecret) {
        logger.warn('[Vapi Webhook] Invalid x-vapi-secret header received');
        return sendError(res, 'Unauthorized webhook call', 401);
      }
    }

    const { message } = req.body;

    if (!message) {
      return res.status(200).json({ received: true });
    }

    logger.info(`[Vapi Webhook] Event: '${message.type}' | EndedReason: '${message.endedReason || 'N/A'}'`);

    // 1. Assistant Request (Vapi checking if you want to override assistant)
    if (message.type === 'assistant-request') {
      // Returning empty object tells Vapi to use the existing dashboard assistant config
      return res.status(200).json({});
    }

    // 2. Tool / Function Calls
    if (message.type === 'tool-calls' && Array.isArray(message.toolCalls)) {
      const results = [];

      for (const toolCall of message.toolCalls) {
        const { id, function: fn } = toolCall;
        const toolResult = await voiceService.executeToolCall(fn.name, fn.arguments);

        results.push({
          toolCallId: id,
          result: JSON.stringify(toolResult),
        });
      }

      return res.status(200).json({ results });
    }

    // 3. End of Call Report (Print exact ended reason to terminal)
    if (message.type === 'end-of-call-report') {
      logger.info(`[Vapi Call Summary] Reason: ${message.endedReason} | Summary: ${message.summary}`);
      const log = await voiceService.handleEndOfCallReport(message);
      return res.status(200).json({ success: true, callId: log.id });
    }

    // 4. Default 200 OK for status-update, speech-update, transcript, etc.
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('[Vapi Webhook Error]:', error.message);
    next(error);
  }
};

/**
 * GET /api/v1/voice/logs
 * Retrieve past mentor call transcripts and summaries
 */
const getCallLogs = async (req, res, next) => {
  try {
    const logs = await voiceService.getCallLogs();
    return sendSuccess(res, logs, 'Call logs retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/voice/query (Backwards compatibility)
 */
const processVoiceQuery = async (req, res, next) => {
  try {
    const { query = '' } = req.body;
    return sendSuccess(
      res,
      {
        textResponse: `Voice query '${query}' processed by mentor service`,
        audioUrl: null,
      },
      'Voice agent query processed',
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMentorSession,
  getVoiceConfig,
  handleVapiWebhook,
  getCallLogs,
  processVoiceQuery,
};
