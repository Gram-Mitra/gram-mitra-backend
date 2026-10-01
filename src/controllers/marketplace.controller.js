const { sendSuccess, sendError } = require('../utils/response');
const marketplaceService = require('../services/marketplace.service');

/**
 * Farmer Marketplace Controller
 *
 * Hierarchy:
 * ├── Marketplace
 * │   ├── Products
 * │   ├── Create listing
 * │   ├── Update listing
 * │   └── Orders
 */

// ==============================================================================
// 1. PRODUCTS (Listing, Details, Categories & Stats)
// ==============================================================================

/**
 * GET /api/v1/marketplace/products
 * Retrieve agricultural products and farmer listings with multi-criteria filtering
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      state,
      district,
      village,
      is_available,
      seller_id,
      limit,
      offset,
      sort,
      order,
    } = req.query;

    const result = await marketplaceService.getProducts({
      category,
      search,
      minPrice,
      maxPrice,
      state,
      district,
      village,
      is_available,
      seller_id,
      limit,
      offset,
      sort,
      order,
    });

    return sendSuccess(res, result, 'Marketplace products retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/marketplace/products/:id
 * Retrieve details for a specific product listing
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await marketplaceService.getProductById(id);
    return sendSuccess(res, product, 'Product details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * GET /api/v1/marketplace/categories
 * Retrieve all product categories with count and price ranges
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await marketplaceService.getCategories();
    return sendSuccess(res, categories, 'Product categories retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/marketplace/stats
 * Aggregate overview of marketplace listings and activity
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await marketplaceService.getStats();
    return sendSuccess(res, stats, 'Marketplace statistics retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// 2. CREATE LISTING
// ==============================================================================

/**
 * POST /api/v1/marketplace/products OR /api/v1/marketplace/listings
 * Publish a new produce or agricultural listing
 */
const createListing = async (req, res, next) => {
  try {
    const productData = req.body;
    const user = req.user || null;

    const newProduct = await marketplaceService.createProduct(productData, user);
    return sendSuccess(res, newProduct, 'Product listing published successfully', 201);
  } catch (error) {
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

// ==============================================================================
// 3. UPDATE LISTING & MANAGE
// ==============================================================================

/**
 * PUT /api/v1/marketplace/products/:id OR /api/v1/marketplace/listings/:id
 * Update details of an existing listing (price, quantity, availability, description)
 */
const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user || null;

    const updated = await marketplaceService.updateProduct(id, updateData, user);
    return sendSuccess(res, updated, 'Product listing updated successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/marketplace/products/:id OR /api/v1/marketplace/listings/:id
 * Remove or deactivate a product listing
 */
const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user || null;

    const result = await marketplaceService.deleteProduct(id, user);
    return sendSuccess(res, result, 'Product listing deleted successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * GET /api/v1/marketplace/my-listings
 * Retrieve listings published by the currently authenticated seller
 */
const getMyListings = async (req, res, next) => {
  try {
    const sellerId = req.user ? req.user.id : (req.query.seller_id || 'a0000000-0000-0000-0000-000000000001');
    const { limit, offset } = req.query;

    const result = await marketplaceService.getMyListings(sellerId, { limit, offset });
    return sendSuccess(res, result, 'Seller listings retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

// ==============================================================================
// 4. ORDERS
// ==============================================================================

/**
 * POST /api/v1/marketplace/orders
 * Create an order for a listed product
 */
const createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    const user = req.user || null;

    const newOrder = await marketplaceService.createOrder(orderData, user);
    return sendSuccess(res, newOrder, 'Marketplace order placed successfully', 201);
  } catch (error) {
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * GET /api/v1/marketplace/orders
 * List orders with optional filters by buyer, seller, product, status
 */
const getOrders = async (req, res, next) => {
  try {
    const {
      buyer_id,
      seller_id,
      product_id,
      status,
      limit,
      offset,
      sort,
      order,
    } = req.query;

    const result = await marketplaceService.getOrders({
      buyer_id,
      seller_id,
      product_id,
      status,
      limit,
      offset,
      sort,
      order,
    });

    return sendSuccess(res, result, 'Orders retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/marketplace/orders/stats
 * Aggregate metrics on marketplace orders
 */
const getOrderStats = async (req, res, next) => {
  try {
    const stats = await marketplaceService.getOrderStats();
    return sendSuccess(res, stats, 'Order statistics retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/marketplace/orders/:id
 * Retrieve specific order details with product summary
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await marketplaceService.getOrderById(id);
    return sendSuccess(res, order, 'Order details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * PATCH /api/v1/marketplace/orders/:id/status OR PUT /api/v1/marketplace/orders/:id/status
 * Update status of an order (e.g. confirmed, shipped, delivered, cancelled)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return sendError(res, 'Order status is required in request body', 400);
    }

    const updated = await marketplaceService.updateOrderStatus(id, status, notes);
    return sendSuccess(res, updated, `Order status updated to "${status}" successfully`, 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/marketplace/orders/:id OR POST /api/v1/marketplace/orders/:id/cancel
 * Cancel an order and restore the product quantity
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reason = req.body.reason || req.query.reason || 'Order cancelled by user';

    const updated = await marketplaceService.cancelOrder(id, reason);
    return sendSuccess(res, updated, 'Order cancelled successfully and stock restored', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

module.exports = {
  // 1. Products
  getProducts,
  getProductById,
  getCategories,
  getStats,

  // 2. Create listing
  createListing,
  createProduct: createListing,

  // 3. Update listing
  updateListing,
  updateProduct: updateListing,
  deleteListing,
  deleteProduct: deleteListing,
  getMyListings,

  // 4. Orders
  createOrder,
  getOrders,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
