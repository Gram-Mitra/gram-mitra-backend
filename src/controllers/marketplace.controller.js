const { sendSuccess } = require('../utils/response');

/**
 * 6. Farmer Marketplace Controller
 */
const getProducts = async (req, res, next) => {
  try {
    return sendSuccess(res, [], 'Marketplace products list skeleton', 200);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    return sendSuccess(res, { productId: 'sample-prod-id' }, 'Product created skeleton', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  createProduct,
};
