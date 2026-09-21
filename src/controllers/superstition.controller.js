const { sendSuccess } = require('../utils/response');

/**
 * 1. Superstition / Myth vs Fact Controller
 */
const getAllSuperstitions = async (req, res, next) => {
  try {
    return sendSuccess(res, [], 'Superstitions list skeleton', 200);
  } catch (error) {
    next(error);
  }
};

const getSuperstitionById = async (req, res, next) => {
  try {
    return sendSuccess(res, { id: req.params.id }, 'Superstition detail skeleton', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuperstitions,
  getSuperstitionById,
};
