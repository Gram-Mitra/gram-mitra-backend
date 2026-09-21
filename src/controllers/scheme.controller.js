const { sendSuccess } = require('../utils/response');

/**
 * 5. NGO and Government Schemes Controller
 */
const getSchemes = async (req, res, next) => {
  try {
    return sendSuccess(res, [], 'Government schemes list skeleton', 200);
  } catch (error) {
    next(error);
  }
};

const getSchemeById = async (req, res, next) => {
  try {
    return sendSuccess(res, { id: req.params.id }, 'Scheme detail skeleton', 200);
  } catch (error) {
    next(error);
  }
};

const getNgos = async (req, res, next) => {
  try {
    return sendSuccess(res, [], 'NGOs list skeleton', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  getNgos,
};
