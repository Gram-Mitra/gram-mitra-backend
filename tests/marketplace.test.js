const request = require('supertest');
const app = require('../src/app');

describe('Marketplace API Endpoints', () => {
  let createdProductId;
  let createdOrderId;

  // ==========================================================================
  // 1. PRODUCTS (Listing, Filter, Details, Categories & Stats)
  // ==========================================================================
  describe('GET /api/v1/marketplace/products', () => {
    it('should return 200 and a list of agricultural produce/products', async () => {
      const res = await request(app).get('/api/v1/marketplace/products');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('products');
      expect(res.body.data).toHaveProperty('total');
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);

      const first = res.body.data.products[0];
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('price');
      expect(first).toHaveProperty('quantity');
      expect(first).toHaveProperty('unit');
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/v1/marketplace/products?category=Grains');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      res.body.data.products.forEach((p) => {
        expect(p.category.toLowerCase()).toContain('grain');
      });
    });

    it('should search products by keyword', async () => {
      const res = await request(app).get('/api/v1/marketplace/products?search=Rice');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      expect(res.body.data.products[0].name.toLowerCase()).toContain('rice');
    });

    it('should filter products by price range', async () => {
      const res = await request(app).get('/api/v1/marketplace/products?minPrice=500&maxPrice=4000');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      res.body.data.products.forEach((p) => {
        expect(p.price).toBeGreaterThanOrEqual(500);
        expect(p.price).toBeLessThanOrEqual(4000);
      });
    });

    it('should support pagination limit and offset', async () => {
      const res = await request(app).get('/api/v1/marketplace/products?limit=2&offset=1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeLessThanOrEqual(2);
      expect(res.body.data.offset).toEqual(1);
    });
  });

  describe('GET /api/v1/marketplace/categories', () => {
    it('should return categories with item counts and price boundaries', async () => {
      const res = await request(app).get('/api/v1/marketplace/categories');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstCat = res.body.data[0];
      expect(firstCat).toHaveProperty('name');
      expect(firstCat).toHaveProperty('count');
      expect(firstCat).toHaveProperty('min_price');
      expect(firstCat).toHaveProperty('max_price');
    });
  });

  describe('GET /api/v1/marketplace/stats', () => {
    it('should return aggregate metrics on marketplace activity', async () => {
      const res = await request(app).get('/api/v1/marketplace/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_products');
      expect(res.body.data).toHaveProperty('active_listings');
      expect(res.body.data).toHaveProperty('total_categories');
      expect(res.body.data).toHaveProperty('total_orders');
      expect(res.body.data.total_products).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/marketplace/products/:id', () => {
    it('should return product details for a valid ID', async () => {
      const listRes = await request(app).get('/api/v1/marketplace/products');
      const targetId = listRes.body.data.products[0].id;

      const res = await request(app).get(`/api/v1/marketplace/products/${targetId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toEqual(targetId);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('price');
    });

    it('should return 404 for a non-existent product ID', async () => {
      const res = await request(app).get('/api/v1/marketplace/products/00000000-0000-0000-0000-000000000000');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 2. CREATE LISTING
  // ==========================================================================
  describe('POST /api/v1/marketplace/products (Create Listing)', () => {
    it('should successfully publish a new product listing', async () => {
      const newListing = {
        name: 'Organic Basmati Paddy (Pusa 1121)',
        description: 'Naturally cultivated premium fragrant Basmati paddy direct from field.',
        category: 'Grains',
        price: 3800,
        unit: 'quintal',
        quantity: 60,
        state: 'Punjab',
        district: 'Amritsar',
        village: 'Majitha',
        location: 'Amritsar Grain Mandi',
        seller_name: 'Gurpreet Singh',
        seller_phone: '9814012345',
      };

      const res = await request(app)
        .post('/api/v1/marketplace/products')
        .send(newListing);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toEqual('Organic Basmati Paddy (Pusa 1121)');
      expect(res.body.data.price).toEqual(3800);
      expect(res.body.data.is_available).toBe(true);

      createdProductId = res.body.data.id;
    });

    it('should also create listing via /api/v1/marketplace/listings alias', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace/listings')
        .send({
          name: 'Fresh Nagpur Oranges',
          category: 'Fruits',
          price: 60,
          unit: 'kg',
          quantity: 200,
          district: 'Nagpur',
          state: 'Maharashtra',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toEqual('Fresh Nagpur Oranges');
    });

    it('should return 400 if product name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace/products')
        .send({
          price: 500,
          quantity: 10,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Product name is required');
    });

    it('should return 400 if price is invalid or non-positive', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace/products')
        .send({
          name: 'Invalid Item',
          price: -100,
          quantity: 10,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if quantity is missing or non-positive', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace/products')
        .send({
          name: 'Invalid Item',
          price: 100,
          quantity: 0,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 3. UPDATE LISTING
  // ==========================================================================
  describe('PUT /api/v1/marketplace/products/:id (Update Listing)', () => {
    it('should successfully update listing details (price, quantity, description)', async () => {
      expect(createdProductId).toBeDefined();

      const updatePayload = {
        price: 3950,
        quantity: 55,
        description: 'Updated: Special festival offer on aged fragrant Basmati paddy.',
      };

      const res = await request(app)
        .put(`/api/v1/marketplace/products/${createdProductId}`)
        .send(updatePayload);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toEqual(3950);
      expect(res.body.data.quantity).toEqual(55);
      expect(res.body.data.description).toContain('Special festival offer');
    });

    it('should also update listing via /api/v1/marketplace/listings/:id alias', async () => {
      const res = await request(app)
        .put(`/api/v1/marketplace/listings/${createdProductId}`)
        .send({ price: 4000 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toEqual(4000);
    });

    it('should return 400 for invalid price update', async () => {
      const res = await request(app)
        .put(`/api/v1/marketplace/products/${createdProductId}`)
        .send({ price: -50 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when updating non-existent product ID', async () => {
      const res = await request(app)
        .put('/api/v1/marketplace/products/00000000-0000-0000-0000-000000000000')
        .send({ price: 100 });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/marketplace/my-listings', () => {
    it('should return listings for a given seller', async () => {
      const res = await request(app).get('/api/v1/marketplace/my-listings?seller_id=a0000000-0000-0000-0000-000000000001');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('products');
    });
  });

  // ==========================================================================
  // 4. ORDERS
  // ==========================================================================
  describe('POST /api/v1/marketplace/orders (Create Order)', () => {
    it('should create an order, calculate total_price, and decrement stock', async () => {
      expect(createdProductId).toBeDefined();

      // Check current quantity before order
      const prodResBefore = await request(app).get(`/api/v1/marketplace/products/${createdProductId}`);
      const initialStock = prodResBefore.body.data.quantity;
      const unitPrice = prodResBefore.body.data.price;

      const orderPayload = {
        product_id: createdProductId,
        quantity: 5,
        buyer_name: 'Harpreet Kaur',
        buyer_phone: '9876543210',
        delivery_address: 'Golden Temple Road, Amritsar',
        delivery_district: 'Amritsar',
        delivery_state: 'Punjab',
        payment_method: 'cod',
        notes: 'Please dispatch before weekend.',
      };

      const res = await request(app)
        .post('/api/v1/marketplace/orders')
        .send(orderPayload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.product_id).toEqual(createdProductId);
      expect(res.body.data.quantity).toEqual(5);
      expect(res.body.data.unit_price).toEqual(unitPrice);
      expect(res.body.data.total_price).toEqual(5 * unitPrice);
      expect(res.body.data.status).toEqual('pending');
      expect(res.body.data).toHaveProperty('product');
      expect(res.body.data.product.name).toEqual('Organic Basmati Paddy (Pusa 1121)');

      createdOrderId = res.body.data.id;

      // Verify stock was decremented
      const prodResAfter = await request(app).get(`/api/v1/marketplace/products/${createdProductId}`);
      expect(prodResAfter.body.data.quantity).toEqual(initialStock - 5);
    });

    it('should return 400 when requesting quantity greater than available stock', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace/orders')
        .send({
          product_id: createdProductId,
          quantity: 99999, // Exceeds stock
          buyer_name: 'Test Buyer',
          buyer_phone: '9800000000',
          delivery_address: 'Village Chowk',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('exceeds available stock');
    });

    it('should return 400 if required order fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace/orders')
        .send({
          product_id: createdProductId,
          quantity: 1,
          // Missing buyer_name and delivery_address
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when placing order for non-existent product', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace/orders')
        .send({
          product_id: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
          buyer_name: 'Test Buyer',
          buyer_phone: '9812345678',
          delivery_address: 'Sample address',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/marketplace/orders', () => {
    it('should list orders with pagination and total count', async () => {
      const res = await request(app).get('/api/v1/marketplace/orders');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('orders');
      expect(res.body.data).toHaveProperty('total');
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter orders by status', async () => {
      const res = await request(app).get('/api/v1/marketplace/orders?status=confirmed');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      res.body.data.orders.forEach((o) => {
        expect(o.status).toEqual('confirmed');
      });
    });
  });

  describe('GET /api/v1/marketplace/orders/stats', () => {
    it('should return order analytics and revenue counts', async () => {
      const res = await request(app).get('/api/v1/marketplace/orders/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_orders');
      expect(res.body.data).toHaveProperty('total_revenue');
      expect(res.body.data.total_orders).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/marketplace/orders/:id', () => {
    it('should retrieve single order details with linked product', async () => {
      expect(createdOrderId).toBeDefined();

      const res = await request(app).get(`/api/v1/marketplace/orders/${createdOrderId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toEqual(createdOrderId);
      expect(res.body.data).toHaveProperty('total_price');
      expect(res.body.data).toHaveProperty('product');
    });

    it('should return 404 for non-existent order ID', async () => {
      const res = await request(app).get('/api/v1/marketplace/orders/00000000-0000-0000-0000-000000000000');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/marketplace/orders/:id/status (Update Order Status)', () => {
    it('should successfully advance order status to confirmed and then shipped', async () => {
      expect(createdOrderId).toBeDefined();

      const res = await request(app)
        .patch(`/api/v1/marketplace/orders/${createdOrderId}/status`)
        .send({ status: 'confirmed', notes: 'Payment verified, preparing package' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toEqual('confirmed');

      const resShipped = await request(app)
        .patch(`/api/v1/marketplace/orders/${createdOrderId}/status`)
        .send({ status: 'shipped', notes: 'Package dispatched via Gramin Dak Sewa' });

      expect(resShipped.statusCode).toEqual(200);
      expect(resShipped.body.data.status).toEqual('shipped');
    });

    it('should return 400 for invalid order status', async () => {
      const res = await request(app)
        .patch(`/api/v1/marketplace/orders/${createdOrderId}/status`)
        .send({ status: 'invalid_status_xyz' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/marketplace/orders/:id (Cancel Order & Restore Stock)', () => {
    it('should cancel the order and automatically restore product stock', async () => {
      expect(createdOrderId).toBeDefined();
      expect(createdProductId).toBeDefined();

      // Get stock before cancellation
      const beforeRes = await request(app).get(`/api/v1/marketplace/products/${createdProductId}`);
      const stockBeforeCancel = beforeRes.body.data.quantity;

      // Cancel order
      const cancelRes = await request(app)
        .delete(`/api/v1/marketplace/orders/${createdOrderId}`)
        .send({ reason: 'Buyer requested cancellation' });

      expect(cancelRes.statusCode).toEqual(200);
      expect(cancelRes.body.success).toBe(true);
      expect(cancelRes.body.data.status).toEqual('cancelled');

      // Verify stock was restored (+5)
      const afterRes = await request(app).get(`/api/v1/marketplace/products/${createdProductId}`);
      expect(afterRes.body.data.quantity).toEqual(stockBeforeCancel + 5);
    });
  });

  // ==========================================================================
  // 5. DELETE LISTING CLEANUP
  // ==========================================================================
  describe('DELETE /api/v1/marketplace/products/:id', () => {
    it('should delete a product listing', async () => {
      expect(createdProductId).toBeDefined();

      const res = await request(app).delete(`/api/v1/marketplace/products/${createdProductId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // Verify it is no longer found
      const getRes = await request(app).get(`/api/v1/marketplace/products/${createdProductId}`);
      expect(getRes.statusCode).toEqual(404);
    });
  });
});
