const express = require('express');
const {
  // 1. Products
  getProducts,
  getProductById,
  getCategories,
  getStats,

  // 2. Create listing
  createListing,

  // 3. Update listing
  updateListing,
  deleteListing,
  getMyListings,

  // 4. Orders
  createOrder,
  getOrders,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/marketplace.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Marketplace API Routes Hierarchy:
 *
 * ├── Marketplace (/api/v1/marketplace)
 * │   ├── Products
 * │   │   ├── GET    /products             - List products (filtering: category, search, minPrice, maxPrice, district, state, village, is_available)
 * │   │   ├── GET    /categories           - Distinct product categories with counts and price ranges
 * │   │   ├── GET    /stats                - Aggregate marketplace statistics
 * │   │   └── GET    /products/:id         - Single product listing details
 * │   │
 * │   ├── Create listing
 * │   │   ├── POST   /products             - Publish a new product listing
 * │   │   ├── POST   /listings             - Alias for listing creation
 * │   │   └── POST   /create-listing       - Descriptive alias for listing creation
 * │   │
 * │   ├── Update listing
 * │   │   ├── PUT    /products/:id         - Update product price, quantity, availability, or details
 * │   │   ├── PUT    /listings/:id         - Alias for listing update
 * │   │   ├── PUT    /update-listing/:id   - Descriptive alias for listing update
 * │   │   ├── DELETE /products/:id         - Remove product listing
 * │   │   ├── DELETE /listings/:id         - Alias for listing deletion
 * │   │   └── GET    /my-listings          - View listings published by authenticated seller
 * │   │
 * │   └── Orders
 * │       ├── POST   /orders               - Place an order for a listed product (auto price & stock decrement)
 * │       ├── GET    /orders               - List orders (filter by buyer_id, seller_id, status)
 * │       ├── GET    /orders/stats         - Aggregate order statistics & revenues
 * │       ├── GET    /orders/:id           - View single order details with product summary
 * │       ├── PATCH  /orders/:id/status    - Update order status (confirmed, shipped, delivered, cancelled)
 * │       ├── PUT    /orders/:id/status    - Alias for status update
 * │       ├── DELETE /orders/:id           - Cancel order and restore product stock
 * │       └── POST   /orders/:id/cancel    - Explicit cancellation action endpoint
 */

// ------------------------------------------------------------------------------
// 1. Static Metadata & Analytics Endpoints (Placed first to avoid collision with :id)
// ------------------------------------------------------------------------------
router.get('/categories', getCategories);
router.get('/products/categories', getCategories);
router.get('/stats', getStats);
router.get('/products/stats', getStats);
router.get('/my-listings', optionalAuth, getMyListings);

// ------------------------------------------------------------------------------
// 2. Orders Endpoints
// ------------------------------------------------------------------------------
router.get('/orders/stats', getOrderStats);
router.get('/orders', optionalAuth, getOrders);
router.post('/orders', optionalAuth, createOrder);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', optionalAuth, updateOrderStatus);
router.put('/orders/:id/status', optionalAuth, updateOrderStatus);
router.delete('/orders/:id', optionalAuth, cancelOrder);
router.post('/orders/:id/cancel', optionalAuth, cancelOrder);

// ------------------------------------------------------------------------------
// 3. Products & Listings Collection Endpoints
// ------------------------------------------------------------------------------
router.get('/', getProducts);
router.get('/products', getProducts);
router.get('/listings', getProducts);

// ------------------------------------------------------------------------------
// 4. Create Listing Endpoints
// ------------------------------------------------------------------------------
router.post('/', optionalAuth, createListing);
router.post('/products', optionalAuth, createListing);
router.post('/listings', optionalAuth, createListing);
router.post('/create-listing', optionalAuth, createListing);

// ------------------------------------------------------------------------------
// 5. Product / Listing Item Endpoints (:id)
// ------------------------------------------------------------------------------
router.get('/products/:id', getProductById);
router.get('/listings/:id', getProductById);

router.put('/products/:id', optionalAuth, updateListing);
router.put('/listings/:id', optionalAuth, updateListing);
router.put('/update-listing/:id', optionalAuth, updateListing);
router.patch('/products/:id', optionalAuth, updateListing);

router.delete('/products/:id', optionalAuth, deleteListing);
router.delete('/listings/:id', optionalAuth, deleteListing);

module.exports = router;
