const { sendSuccess } = require('../utils/response');

/**
 * 3. Village Problem Resolving Controller
 */
const reportProblem = async (req, res, next) => {
  try {
    return sendSuccess(res, { problemId: 'temp-problem-id' }, 'Village problem submitted skeleton', 201);
  } catch (error) {
    next(error);
  }
};

const getProblems = async (req, res, next) => {
  try {
    return sendSuccess(res, [], 'Village problems list skeleton', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reportProblem,
  getProblems,
};
