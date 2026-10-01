const { randomUUID } = require('crypto');
const { supabase, supabaseAdmin, TABLES } = require('../config/supabase');
const logger = require('../utils/logger');

// UUID format validator
const isValidUUID = (str) => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

/**
 * Fallback dataset for Agricultural Products & Listings
 */
const INITIAL_FALLBACK_PRODUCTS = [
  {
    id: '293e348d-a94d-4e97-921e-62d93527a70b',
    seller_id: '11111111-1111-1111-1111-111111111111',
    name: 'Organic Indrayani Rice',
    description: 'Aromatic, unpolished organic rice freshly harvested from Saphale farms.',
    category: 'Grains',
    price: 85,
    unit: 'kg',
    quantity: 250,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    location: 'Saphale East',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Saphale',
    seller_name: 'Gramin Kisan',
    seller_phone: '9822011223',
    is_available: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
  },
  {
    id: 'f1010001-1111-2222-3333-444455556666',
    seller_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Sharbati Golden Wheat (Grain)',
    description: 'Premium quality organic Sharbati wheat, hand-harvested, zero chemicals, ideal for traditional rotis.',
    category: 'Grains',
    price: 2800,
    unit: 'quintal',
    quantity: 50,
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    location: 'APMC Grain Market, Ashta',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    village: 'Ashta',
    seller_name: 'Rameshwar Patidar',
    seller_phone: '9826011223',
    is_available: true,
    created_at: '2026-09-20T10:00:00.000Z',
    updated_at: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'f1010002-2222-3333-4444-555566667777',
    seller_id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Sona Masoori Raw Rice',
    description: 'Lightweight and aromatic aged Sona Masoori raw rice from the Krishna-Tungabhadra river belt.',
    category: 'Grains',
    price: 3400,
    unit: 'quintal',
    quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    location: 'Sindhanur APMC Mandi',
    state: 'Karnataka',
    district: 'Raichur',
    village: 'Sindhanur',
    seller_name: 'Basavaraj Gowda',
    seller_phone: '9845012345',
    is_available: true,
    created_at: '2026-09-21T11:30:00.000Z',
    updated_at: '2026-09-21T11:30:00.000Z',
  },
  {
    id: 'f1010003-3333-4444-5555-666677778888',
    seller_id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Organic Alphonso Mangoes (GI Tag)',
    description: 'Naturally ripened, export quality Ratnagiri Hapus mangoes directly from coastal coastal orchards.',
    category: 'Fruits',
    price: 850,
    unit: 'box',
    quantity: 120,
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    location: 'Pawali Mango Cooperative',
    state: 'Maharashtra',
    district: 'Ratnagiri',
    village: 'Pawali',
    seller_name: 'Dattatray Sawant',
    seller_phone: '9822114455',
    is_available: true,
    created_at: '2026-09-22T08:15:00.000Z',
    updated_at: '2026-09-22T08:15:00.000Z',
  },
  {
    id: 'f1010004-4444-5555-6666-777788889999',
    seller_id: 'a0000000-0000-0000-0000-000000000004',
    name: 'Fresh Red Hybrid Tomatoes',
    description: 'Farm-fresh, firm red greenhouse hybrid tomatoes harvested daily at dawn for wholesale supply.',
    category: 'Vegetables',
    price: 24,
    unit: 'kg',
    quantity: 800,
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    location: 'Narayangaon Vegetable Mandi',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Narayangaon',
    seller_name: 'Sopanrao Jadhav',
    seller_phone: '9850123890',
    is_available: true,
    created_at: '2026-09-23T07:00:00.000Z',
    updated_at: '2026-09-23T07:00:00.000Z',
  },
  {
    id: 'f1010005-5555-6666-7777-888899990000',
    seller_id: 'a0000000-0000-0000-0000-000000000005',
    name: 'Desi Gir Cow Bilona A2 Ghee',
    description: 'Traditional Vedic Bilona method churned pure A2 ghee made from grass-fed indigenous Gir cow curd.',
    category: 'Dairy',
    price: 1650,
    unit: 'litre',
    quantity: 35,
    image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80',
    location: 'Gokul Gaushala, Bhesan',
    state: 'Gujarat',
    district: 'Junagadh',
    village: 'Bhesan',
    seller_name: 'Bhaveshbhai Patel',
    seller_phone: '9879012345',
    is_available: true,
    created_at: '2026-09-24T09:45:00.000Z',
    updated_at: '2026-09-24T09:45:00.000Z',
  },
  {
    id: 'f1010006-6666-7777-8888-999900001111',
    seller_id: 'a0000000-0000-0000-0000-000000000006',
    name: 'Certified Organic Soybean Seeds (JS 335)',
    description: 'High germination rate certified drought-resistant soybean seeds tested by state seed corporation.',
    category: 'Seeds',
    price: 4300,
    unit: 'quintal',
    quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
    location: 'Ausa Krishi Seva Kendra',
    state: 'Maharashtra',
    district: 'Latur',
    village: 'Ausa',
    seller_name: 'Balasaheb Deshmukh',
    seller_phone: '9823098765',
    is_available: true,
    created_at: '2026-09-25T14:20:00.000Z',
    updated_at: '2026-09-25T14:20:00.000Z',
  },
  {
    id: 'f1010007-7777-8888-9999-000011112222',
    seller_id: 'a0000000-0000-0000-0000-000000000007',
    name: 'Solar Powered Agriculture Water Pump (5HP)',
    description: 'BLDC high efficiency submersible solar water pump set with MPPT controller and mounting structure.',
    category: 'Equipment',
    price: 64000,
    unit: 'unit',
    quantity: 5,
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    location: 'Kisan Urja Workshop, Manor',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Manor',
    seller_name: 'Kisan Urja Vikas Samiti',
    seller_phone: '9822088776',
    is_available: true,
    created_at: '2026-09-26T16:00:00.000Z',
    updated_at: '2026-09-26T16:00:00.000Z',
  },
];

/**
 * Fallback dataset for Orders
 */
const INITIAL_FALLBACK_ORDERS = [
  {
    id: 'b2020001-1111-2222-3333-444455556666',
    product_id: 'f1010002-2222-3333-4444-555566667777',
    buyer_id: 'c0000000-0000-0000-0000-000000000001',
    seller_id: 'a0000000-0000-0000-0000-000000000002',
    buyer_name: 'Sunita Sharma',
    buyer_phone: '9811223344',
    quantity: 2,
    unit_price: 3400,
    total_price: 6800,
    status: 'confirmed',
    delivery_address: 'Main Bazaar, Saphale West, Palghar',
    delivery_village: 'Saphale',
    delivery_district: 'Palghar',
    delivery_state: 'Maharashtra',
    payment_method: 'cod',
    payment_status: 'unpaid',
    notes: 'Please call before delivery during morning hours.',
    created_at: '2026-09-27T10:30:00.000Z',
    updated_at: '2026-09-27T12:00:00.000Z',
  },
  {
    id: 'b2020002-2222-3333-4444-555566667777',
    product_id: 'f1010005-5555-6666-7777-888899990000',
    buyer_id: 'c0000000-0000-0000-0000-000000000002',
    seller_id: 'a0000000-0000-0000-0000-000000000005',
    buyer_name: 'Ganesh Kadam',
    buyer_phone: '9822334455',
    quantity: 1,
    unit_price: 1650,
    total_price: 1650,
    status: 'delivered',
    delivery_address: 'Shivaji Chowk, Virar East',
    delivery_village: 'Virar',
    delivery_district: 'Palghar',
    delivery_state: 'Maharashtra',
    payment_method: 'upi',
    payment_status: 'paid',
    notes: 'Delivered in good condition with seal intact.',
    created_at: '2026-09-28T09:00:00.000Z',
    updated_at: '2026-09-29T14:30:00.000Z',
  },
];

class MarketplaceService {
  constructor() {
    this.fallbackProducts = JSON.parse(JSON.stringify(INITIAL_FALLBACK_PRODUCTS));
    this.fallbackOrders = JSON.parse(JSON.stringify(INITIAL_FALLBACK_ORDERS));
  }

  getClient() {
    return supabaseAdmin || supabase;
  }

  // ============================================================================
  // 1. PRODUCTS & BROWSE SERVICES
  // ============================================================================

  /**
   * List all products with filtering, search, sorting, and pagination
   */
  async getProducts(options = {}) {
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
      limit = 20,
      offset = 0,
      sort = 'created_at',
      order = 'desc',
    } = options;

    const client = this.getClient();

    if (client) {
      try {
        let query = client.from(TABLES.PRODUCTS).select('*');

        if (is_available !== undefined && is_available !== 'all') {
          query = query.eq('is_available', is_available === true || is_available === 'true');
        }

        if (seller_id) {
          query = query.eq('seller_id', seller_id);
        }

        if (category && category !== 'all') {
          query = query.ilike('category', `%${category.trim()}%`);
        }

        if (district) {
          query = query.ilike('district', `%${district.trim()}%`);
        }

        if (state) {
          query = query.ilike('state', `%${state.trim()}%`);
        }

        if (village) {
          query = query.ilike('village', `%${village.trim()}%`);
        }

        if (minPrice && !isNaN(Number(minPrice))) {
          query = query.gte('price', Number(minPrice));
        }

        if (maxPrice && !isNaN(Number(maxPrice))) {
          query = query.lte('price', Number(maxPrice));
        }

        const ascending = String(order).toLowerCase() === 'asc';
        query = query.order(sort, { ascending });

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          let products = data;

          if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            products = products.filter((p) => {
              const nameMatch = p.name && p.name.toLowerCase().includes(s);
              const descMatch = p.description && p.description.toLowerCase().includes(s);
              const catMatch = p.category && p.category.toLowerCase().includes(s);
              const locMatch = p.location && p.location.toLowerCase().includes(s);
              const distMatch = p.district && p.district.toLowerCase().includes(s);
              const villMatch = p.village && p.village.toLowerCase().includes(s);
              return nameMatch || descMatch || catMatch || locMatch || distMatch || villMatch;
            });
          }

          const total = products.length;
          const paginated = products.slice(Number(offset), Number(offset) + Number(limit));

          return {
            total,
            limit: Number(limit),
            offset: Number(offset),
            products: paginated,
          };
        }
      } catch (err) {
        logger.warn('Error querying Supabase products, falling back to memory store:', err.message);
      }
    }

    // Fallback store filter
    let products = [...this.fallbackProducts];

    if (is_available !== undefined && is_available !== 'all') {
      const boolVal = is_available === true || is_available === 'true';
      products = products.filter((p) => p.is_available === boolVal);
    }

    if (seller_id) {
      products = products.filter((p) => p.seller_id === seller_id);
    }

    if (category && category !== 'all') {
      const c = category.toLowerCase().trim();
      products = products.filter((p) => p.category && p.category.toLowerCase().includes(c));
    }

    if (district) {
      const d = district.toLowerCase().trim();
      products = products.filter((p) => p.district && p.district.toLowerCase().includes(d));
    }

    if (state) {
      const st = state.toLowerCase().trim();
      products = products.filter((p) => p.state && p.state.toLowerCase().includes(st));
    }

    if (village) {
      const v = village.toLowerCase().trim();
      products = products.filter((p) => p.village && p.village.toLowerCase().includes(v));
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      products = products.filter((p) => Number(p.price) >= Number(minPrice));
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      products = products.filter((p) => Number(p.price) <= Number(maxPrice));
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      products = products.filter((p) => {
        const nameMatch = p.name && p.name.toLowerCase().includes(s);
        const descMatch = p.description && p.description.toLowerCase().includes(s);
        const catMatch = p.category && p.category.toLowerCase().includes(s);
        const locMatch = p.location && p.location.toLowerCase().includes(s);
        const distMatch = p.district && p.district.toLowerCase().includes(s);
        const villMatch = p.village && p.village.toLowerCase().includes(s);
        return nameMatch || descMatch || catMatch || locMatch || distMatch || villMatch;
      });
    }

    // Sort products
    const ascending = String(order).toLowerCase() === 'asc';
    products.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];
      if (sort === 'price' || sort === 'quantity') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

    const total = products.length;
    const paginated = products.slice(Number(offset), Number(offset) + Number(limit));

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      products: paginated,
    };
  }

  /**
   * Get single product listing by ID
   */
  async getProductById(id) {
    if (!id) {
      const err = new Error('Product ID is required');
      err.statusCode = 400;
      throw err;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        const { data, error } = await client
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        logger.warn(`Supabase fetch failed for product ${id}:`, err.message);
      }
    }

    // Fallback store lookup
    const found = this.fallbackProducts.find((p) => String(p.id) === String(id));
    if (!found) {
      const err = new Error(`Product listing with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    return found;
  }

  /**
   * Retrieve distinct categories with counts and price ranges
   */
  async getCategories() {
    const { products } = await this.getProducts({ limit: 1000, is_available: 'all' });
    const categoryMap = {};

    products.forEach((p) => {
      const cat = p.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          name: cat,
          count: 0,
          min_price: Number(p.price) || 0,
          max_price: Number(p.price) || 0,
          active_count: 0,
        };
      }
      categoryMap[cat].count += 1;
      if (p.is_available) {
        categoryMap[cat].active_count += 1;
      }
      const price = Number(p.price) || 0;
      categoryMap[cat].min_price = Math.min(categoryMap[cat].min_price, price);
      categoryMap[cat].max_price = Math.max(categoryMap[cat].max_price, price);
    });

    return Object.values(categoryMap);
  }

  /**
   * Retrieve aggregate statistics on marketplace products and activity
   */
  async getStats() {
    const { products } = await this.getProducts({ limit: 1000, is_available: 'all' });
    const activeProducts = products.filter((p) => p.is_available);
    const outOfStock = products.filter((p) => !p.is_available || Number(p.quantity) <= 0);

    const categories = new Set(products.map((p) => p.category).filter(Boolean));
    const districts = new Set(products.map((p) => p.district).filter(Boolean));
    const states = new Set(products.map((p) => p.state).filter(Boolean));

    const totalOrders = this.fallbackOrders.length;
    const avgPrice = activeProducts.length > 0
      ? Math.round(activeProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / activeProducts.length)
      : 0;

    return {
      total_products: products.length,
      active_listings: activeProducts.length,
      out_of_stock_listings: outOfStock.length,
      total_categories: categories.size,
      total_districts_covered: districts.size,
      total_states_covered: states.size,
      total_orders: totalOrders,
      average_listing_price: avgPrice,
      categories: Array.from(categories),
    };
  }

  // ============================================================================
  // 2. CREATE LISTING
  // ============================================================================

  /**
   * Create a new produce/item listing
   */
  async createProduct(productData, user = null) {
    const {
      name,
      description,
      category = 'General',
      price,
      unit = 'kg',
      quantity,
      image_url,
      location,
      state,
      district,
      village,
      seller_name,
      seller_phone,
      is_available = true,
    } = productData;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      const err = new Error('Product name is required');
      err.statusCode = 400;
      throw err;
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
      const err = new Error('A valid price greater than 0 is required');
      err.statusCode = 400;
      throw err;
    }

    if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      const err = new Error('A valid quantity greater than 0 is required');
      err.statusCode = 400;
      throw err;
    }

    // Determine seller UUID
    let sellerId = 'a0000000-0000-0000-0000-000000000001';
    if (user && user.id && isValidUUID(user.id)) {
      sellerId = user.id;
    } else if (productData.seller_id && isValidUUID(productData.seller_id)) {
      sellerId = productData.seller_id;
    }

    const newProduct = {
      id: randomUUID(),
      seller_id: sellerId,
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'General',
      price: Number(price),
      unit: unit ? unit.trim().toLowerCase() : 'kg',
      quantity: Number(quantity),
      image_url: image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      location: location || '',
      state: state || '',
      district: district || '',
      village: village || '',
      seller_name: seller_name || (user && user.user_metadata && user.user_metadata.full_name) || 'Local Farmer',
      seller_phone: seller_phone || (user && user.phone) || '',
      is_available: is_available === true || is_available === 'true',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const client = this.getClient();
    let savedInDb = false;

    if (client) {
      try {
        const { data, error } = await client
          .from(TABLES.PRODUCTS)
          .insert({
            id: newProduct.id,
            seller_id: newProduct.seller_id,
            name: newProduct.name,
            description: newProduct.description,
            category: newProduct.category,
            price: newProduct.price,
            unit: newProduct.unit,
            quantity: newProduct.quantity,
            image_url: newProduct.image_url,
            location: newProduct.location,
            state: newProduct.state,
            district: newProduct.district,
            is_available: newProduct.is_available,
          })
          .select()
          .single();

        if (!error && data) {
          savedInDb = true;
          newProduct.created_at = data.created_at || newProduct.created_at;
          newProduct.updated_at = data.updated_at || newProduct.updated_at;
        }
      } catch (err) {
        logger.warn('Could not insert product into Supabase, saving in memory store:', err.message);
      }
    }

    // Always maintain in fallback memory store
    this.fallbackProducts.unshift(newProduct);

    return newProduct;
  }

  // ============================================================================
  // 3. UPDATE & MANAGE LISTING
  // ============================================================================

  /**
   * Update an existing product listing
   */
  async updateProduct(id, updateData, user = null) {
    if (!id) {
      const err = new Error('Product ID is required');
      err.statusCode = 400;
      throw err;
    }

    const existingProduct = await this.getProductById(id);

    // Validate update fields
    if (updateData.price !== undefined) {
      if (isNaN(Number(updateData.price)) || Number(updateData.price) <= 0) {
        const err = new Error('Price must be a valid positive number');
        err.statusCode = 400;
        throw err;
      }
    }

    if (updateData.quantity !== undefined) {
      if (isNaN(Number(updateData.quantity)) || Number(updateData.quantity) < 0) {
        const err = new Error('Quantity must be a valid non-negative number');
        err.statusCode = 400;
        throw err;
      }
    }

    const updatedQty = updateData.quantity !== undefined ? Number(updateData.quantity) : existingProduct.quantity;
    const isAvail = updateData.is_available !== undefined
      ? (updateData.is_available === true || updateData.is_available === 'true')
      : (updatedQty > 0 ? existingProduct.is_available : false);

    const merged = {
      ...existingProduct,
      ...(updateData.name && { name: updateData.name.trim() }),
      ...(updateData.description !== undefined && { description: updateData.description.trim() }),
      ...(updateData.category && { category: updateData.category.trim() }),
      ...(updateData.price !== undefined && { price: Number(updateData.price) }),
      ...(updateData.unit && { unit: updateData.unit.trim().toLowerCase() }),
      ...(updateData.quantity !== undefined && { quantity: Number(updateData.quantity) }),
      ...(updateData.image_url && { image_url: updateData.image_url }),
      ...(updateData.location !== undefined && { location: updateData.location }),
      ...(updateData.state !== undefined && { state: updateData.state }),
      ...(updateData.district !== undefined && { district: updateData.district }),
      ...(updateData.village !== undefined && { village: updateData.village }),
      is_available: isAvail,
      updated_at: new Date().toISOString(),
    };

    const client = this.getClient();
    if (client && isValidUUID(id)) {
      try {
        await client
          .from(TABLES.PRODUCTS)
          .update({
            name: merged.name,
            description: merged.description,
            category: merged.category,
            price: merged.price,
            unit: merged.unit,
            quantity: merged.quantity,
            image_url: merged.image_url,
            location: merged.location,
            state: merged.state,
            district: merged.district,
            is_available: merged.is_available,
            updated_at: merged.updated_at,
          })
          .eq('id', id);
      } catch (err) {
        logger.warn(`Supabase update failed for product ${id}:`, err.message);
      }
    }

    // Update in fallback memory store
    const idx = this.fallbackProducts.findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      this.fallbackProducts[idx] = merged;
    } else {
      this.fallbackProducts.unshift(merged);
    }

    return merged;
  }

  /**
   * Delete or deactivate a product listing
   */
  async deleteProduct(id, user = null) {
    if (!id) {
      const err = new Error('Product ID is required');
      err.statusCode = 400;
      throw err;
    }

    // Verify existence
    await this.getProductById(id);

    const client = this.getClient();
    if (client && isValidUUID(id)) {
      try {
        await client.from(TABLES.PRODUCTS).delete().eq('id', id);
      } catch (err) {
        logger.warn(`Supabase deletion failed for product ${id}:`, err.message);
      }
    }

    // Remove from in-memory fallback
    this.fallbackProducts = this.fallbackProducts.filter((p) => String(p.id) !== String(id));

    return {
      success: true,
      message: 'Product listing deleted successfully',
      productId: id,
    };
  }

  /**
   * Get listings created by a specific seller
   */
  async getMyListings(sellerId, options = {}) {
    if (!sellerId) {
      const err = new Error('Seller ID is required');
      err.statusCode = 400;
      throw err;
    }

    return this.getProducts({
      ...options,
      seller_id: sellerId,
      is_available: 'all',
    });
  }

  // ============================================================================
  // 4. ORDERS SERVICE
  // ============================================================================

  /**
   * Place an order for a listed product
   */
  async createOrder(orderData, user = null) {
    const {
      product_id,
      quantity,
      buyer_name,
      buyer_phone,
      delivery_address,
      delivery_village,
      delivery_district,
      delivery_state,
      payment_method = 'cod',
      notes,
    } = orderData;

    // 1. Validate required inputs
    if (!product_id) {
      const err = new Error('product_id is required to place an order');
      err.statusCode = 400;
      throw err;
    }

    const orderQty = Number(quantity);
    if (!quantity || isNaN(orderQty) || orderQty <= 0) {
      const err = new Error('A valid quantity greater than 0 is required');
      err.statusCode = 400;
      throw err;
    }

    const resolvedBuyerName = buyer_name || (user && user.user_metadata && user.user_metadata.full_name) || (user && user.email);
    if (!resolvedBuyerName || !String(resolvedBuyerName).trim()) {
      const err = new Error('buyer_name is required');
      err.statusCode = 400;
      throw err;
    }

    const resolvedBuyerPhone = buyer_phone || (user && user.phone);
    if (!resolvedBuyerPhone || !String(resolvedBuyerPhone).trim()) {
      const err = new Error('buyer_phone is required for order coordination and delivery');
      err.statusCode = 400;
      throw err;
    }

    if (!delivery_address || !String(delivery_address).trim()) {
      const err = new Error('delivery_address is required');
      err.statusCode = 400;
      throw err;
    }

    // 2. Fetch and verify product availability
    const product = await this.getProductById(product_id);

    if (!product.is_available) {
      const err = new Error(`Listing "${product.name}" is currently marked as unavailable or out of stock`);
      err.statusCode = 400;
      throw err;
    }

    const currentStock = Number(product.quantity);
    if (orderQty > currentStock) {
      const err = new Error(`Requested quantity (${orderQty} ${product.unit}) exceeds available stock (${currentStock} ${product.unit})`);
      err.statusCode = 400;
      throw err;
    }

    // 3. Price calculation
    const unitPrice = Number(product.price);
    const totalPrice = Math.round(orderQty * unitPrice * 100) / 100;

    // 4. Stock decrement
    const remainingStock = Math.max(0, currentStock - orderQty);
    const isNowAvailable = remainingStock > 0;

    await this.updateProduct(product.id, {
      quantity: remainingStock,
      is_available: isNowAvailable,
    });

    // 5. Construct order
    const orderId = randomUUID();
    const buyerId = (user && user.id && isValidUUID(user.id))
      ? user.id
      : (isValidUUID(orderData.buyer_id) ? orderData.buyer_id : null);

    const newOrder = {
      id: orderId,
      product_id: product.id,
      buyer_id: buyerId,
      seller_id: product.seller_id,
      buyer_name: String(resolvedBuyerName).trim(),
      buyer_phone: String(resolvedBuyerPhone).trim(),
      quantity: orderQty,
      unit_price: unitPrice,
      total_price: totalPrice,
      status: 'pending',
      delivery_address: String(delivery_address).trim(),
      delivery_village: delivery_village || product.village || '',
      delivery_district: delivery_district || product.district || '',
      delivery_state: delivery_state || product.state || '',
      payment_method: payment_method || 'cod',
      payment_status: 'unpaid',
      notes: notes ? String(notes).trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        unit: product.unit,
        image_url: product.image_url,
      },
    };

    // 6. Persist order in Supabase if connected
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from(TABLES.ORDERS)
          .insert({
            id: newOrder.id,
            product_id: newOrder.product_id,
            buyer_id: newOrder.buyer_id,
            seller_id: newOrder.seller_id,
            buyer_name: newOrder.buyer_name,
            buyer_phone: newOrder.buyer_phone,
            quantity: newOrder.quantity,
            unit_price: newOrder.unit_price,
            total_price: newOrder.total_price,
            status: newOrder.status,
            delivery_address: newOrder.delivery_address,
            delivery_village: newOrder.delivery_village,
            delivery_district: newOrder.delivery_district,
            delivery_state: newOrder.delivery_state,
            payment_method: newOrder.payment_method,
            payment_status: newOrder.payment_status,
            notes: newOrder.notes,
          })
          .select()
          .single();

        if (!error && data) {
          newOrder.created_at = data.created_at || newOrder.created_at;
          newOrder.updated_at = data.updated_at || newOrder.updated_at;
        }
      } catch (err) {
        logger.warn('Could not insert order into Supabase, saving in memory store:', err.message);
      }
    }

    // Always maintain in fallback memory store
    this.fallbackOrders.unshift(newOrder);

    return newOrder;
  }

  /**
   * List orders with filtering and pagination
   */
  async getOrders(options = {}) {
    const {
      buyer_id,
      seller_id,
      product_id,
      status,
      limit = 20,
      offset = 0,
      sort = 'created_at',
      order = 'desc',
    } = options;

    const client = this.getClient();

    if (client) {
      try {
        let query = client.from(TABLES.ORDERS).select('*');

        if (buyer_id) {
          query = query.eq('buyer_id', buyer_id);
        }
        if (seller_id) {
          query = query.eq('seller_id', seller_id);
        }
        if (product_id) {
          query = query.eq('product_id', product_id);
        }
        if (status && status !== 'all') {
          query = query.eq('status', status.toLowerCase().trim());
        }

        const ascending = String(order).toLowerCase() === 'asc';
        query = query.order(sort, { ascending });

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          const total = data.length;
          const paginated = data.slice(Number(offset), Number(offset) + Number(limit));

          // Enrich with product details
          const enriched = paginated.map((ord) => {
            const p = this.fallbackProducts.find((item) => String(item.id) === String(ord.product_id));
            return {
              ...ord,
              product: p
                ? { id: p.id, name: p.name, category: p.category, unit: p.unit, image_url: p.image_url }
                : null,
            };
          });

          return {
            total,
            limit: Number(limit),
            offset: Number(offset),
            orders: enriched,
          };
        }
      } catch (err) {
        logger.warn('Error querying Supabase orders, using memory store:', err.message);
      }
    }

    // In-memory fallback orders filter
    let orders = [...this.fallbackOrders];

    if (buyer_id) {
      orders = orders.filter((o) => o.buyer_id === buyer_id);
    }
    if (seller_id) {
      orders = orders.filter((o) => o.seller_id === seller_id);
    }
    if (product_id) {
      orders = orders.filter((o) => String(o.product_id) === String(product_id));
    }
    if (status && status !== 'all') {
      const st = status.toLowerCase().trim();
      orders = orders.filter((o) => o.status && o.status.toLowerCase() === st);
    }

    const ascending = String(order).toLowerCase() === 'asc';
    orders.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];
      if (sort === 'total_price' || sort === 'quantity') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

    const total = orders.length;
    const paginated = orders.slice(Number(offset), Number(offset) + Number(limit));

    // Enrich with product information
    const enriched = paginated.map((ord) => {
      if (ord.product) return ord;
      const p = this.fallbackProducts.find((item) => String(item.id) === String(ord.product_id));
      return {
        ...ord,
        product: p
          ? { id: p.id, name: p.name, category: p.category, unit: p.unit, image_url: p.image_url }
          : null,
      };
    });

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      orders: enriched,
    };
  }

  /**
   * Get single order by ID with product details
   */
  async getOrderById(id) {
    if (!id) {
      const err = new Error('Order ID is required');
      err.statusCode = 400;
      throw err;
    }

    const client = this.getClient();
    let order = null;

    if (client && isValidUUID(id)) {
      try {
        const { data, error } = await client
          .from(TABLES.ORDERS)
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          order = data;
        }
      } catch (err) {
        logger.warn(`Supabase order lookup failed for ${id}:`, err.message);
      }
    }

    if (!order) {
      order = this.fallbackOrders.find((o) => String(o.id) === String(id));
    }

    if (!order) {
      const err = new Error(`Order with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    // Attach product
    const p = this.fallbackProducts.find((item) => String(item.id) === String(order.product_id));
    return {
      ...order,
      product: p
        ? { id: p.id, name: p.name, category: p.category, unit: p.unit, price: p.price, image_url: p.image_url }
        : order.product || null,
    };
  }

  /**
   * Update order status (e.g. pending -> confirmed -> shipped -> delivered, or cancelled)
   */
  async updateOrderStatus(id, newStatus, notes = null) {
    if (!id) {
      const err = new Error('Order ID is required');
      err.statusCode = 400;
      throw err;
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const normalizedStatus = String(newStatus).toLowerCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      const err = new Error(`Invalid order status "${newStatus}". Must be one of: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const existingOrder = await this.getOrderById(id);

    // If order is transitioning to cancelled from non-cancelled status, restore stock!
    if (normalizedStatus === 'cancelled' && existingOrder.status !== 'cancelled') {
      try {
        const product = await this.getProductById(existingOrder.product_id);
        const restoredQty = Number(product.quantity) + Number(existingOrder.quantity);
        await this.updateProduct(product.id, {
          quantity: restoredQty,
          is_available: true,
        });
        logger.info(`Restored stock for product ${product.id} by +${existingOrder.quantity} ${product.unit}`);
      } catch (restoreErr) {
        logger.warn(`Could not restore product stock for cancelled order ${id}:`, restoreErr.message);
      }
    }

    const updatedOrder = {
      ...existingOrder,
      status: normalizedStatus,
      ...(notes && { notes: notes.trim() }),
      updated_at: new Date().toISOString(),
    };

    const client = this.getClient();
    if (client && isValidUUID(id)) {
      try {
        await client
          .from(TABLES.ORDERS)
          .update({
            status: updatedOrder.status,
            notes: updatedOrder.notes,
            updated_at: updatedOrder.updated_at,
          })
          .eq('id', id);
      } catch (err) {
        logger.warn(`Supabase order update failed for ${id}:`, err.message);
      }
    }

    // Update in-memory fallback
    const idx = this.fallbackOrders.findIndex((o) => String(o.id) === String(id));
    if (idx !== -1) {
      this.fallbackOrders[idx] = updatedOrder;
    }

    return updatedOrder;
  }

  /**
   * Cancel order convenience helper
   */
  async cancelOrder(id, reason = 'Cancelled by buyer/seller') {
    return this.updateOrderStatus(id, 'cancelled', reason);
  }

  /**
   * Get order statistics & summaries
   */
  async getOrderStats() {
    const orders = this.fallbackOrders;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const confirmed = orders.filter((o) => o.status === 'confirmed').length;
    const processing = orders.filter((o) => o.status === 'processing').length;
    const shipped = orders.filter((o) => o.status === 'shipped').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

    return {
      total_orders: orders.length,
      pending_orders: pending,
      confirmed_orders: confirmed,
      processing_orders: processing,
      shipped_orders: shipped,
      delivered_orders: delivered,
      cancelled_orders: cancelled,
      total_revenue: totalRevenue,
    };
  }
}

module.exports = new MarketplaceService();
