const { sendSuccess } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    return sendSuccess(res, { user: null }, 'Auth register endpoint skeleton', 200);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    return sendSuccess(res, { token: 'sample-jwt-token' }, 'Auth login endpoint skeleton', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
