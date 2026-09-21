const { sendSuccess } = require('../utils/response');

/**
 * 4. Voice Agent & AI Farmer Assistance Controller
 */
const processVoiceQuery = async (req, res, next) => {
  try {
    return sendSuccess(
      res,
      {
        textResponse: 'Voice query received (skeleton)',
        audioUrl: null,
      },
      'Voice agent query processed skeleton',
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processVoiceQuery,
};
