const { supabase, supabaseAdmin, TABLES } = require('../config/supabase');
const logger = require('../utils/logger');

// UUID format validator
const isValidUUID = (str) => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// Earth radius in kilometers for distance calculations
const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula to compute distance between two coordinates in kilometers
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = parseFloat(lat1);
  const numLon1 = parseFloat(lon1);
  const numLat2 = parseFloat(lat2);
  const numLon2 = parseFloat(lon2);

  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(numLat2 - numLat1);
  const dLon = toRad(numLon2 - numLon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(numLat1)) * Math.cos(toRad(numLat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
};

/**
 * Fallback dataset for NGOs
 */
const FALLBACK_NGOS = [
  {
    id: '7b480a9c-7d9b-4985-97b9-341881c83137',
    name: 'Gramin Vikas Sanstha',
    description: 'Dedicated to promoting sustainable organic agriculture, drip irrigation, and soil health testing.',
    category: 'Agriculture',
    phone: '9822012345',
    email: 'info@graminvikas.org',
    website: 'https://graminvikas.org',
    address: 'Station Road, Saphale West',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Saphale',
    latitude: 19.578,
    longitude: 72.824,
    services: 'Soil Testing, Organic Farming Workshops, Drip Irrigation Subsidies',
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
  },
  {
    id: 'd7e6b24b-e826-4485-bc68-bb0e4c9515bc',
    name: 'Pashu Kalyan Trust',
    description: 'Provides mobile veterinary care, vaccination drives, and rescue services for livestock and domestic animals.',
    category: 'Animal Welfare',
    phone: '9822098765',
    email: 'contact@pashukalyan.org',
    website: 'https://pashukalyan.org',
    address: 'Agashi Road, Virar West',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Virar',
    latitude: 19.467,
    longitude: 72.805,
    services: 'Mobile Vet Clinic, Free Animal Rabies Vaccination, Emergency Rescue',
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
  },
  {
    id: '1a2b3c4d-1111-2222-3333-444455556666',
    name: 'PRADAN (Professional Assistance for Development Action)',
    description: 'Empowering rural women through Self-Help Groups (SHGs), watershed development, and livelihood promotion.',
    category: 'Livelihoods & Women Empowerment',
    phone: '011-40407700',
    email: 'headoffice@pradan.net',
    website: 'https://www.pradan.net',
    address: 'C-3 Community Centre, SDA',
    state: 'National',
    district: 'Multi-district',
    village: 'National',
    latitude: 28.545,
    longitude: 77.198,
    services: 'SHG Formation, Integrated Natural Resource Management, Farmer Producer Organizations (FPOs)',
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
  },
  {
    id: '2b3c4d5e-2222-3333-4444-555566667777',
    name: 'SEWA Bharat (Self Employed Women’s Association)',
    description: 'Supporting poor informal women workers with social security, financial inclusion, microfinance, and healthcare literacy.',
    category: 'Women Empowerment',
    phone: '011-25841369',
    email: 'mail@sewabharat.org',
    website: 'https://sewabharat.org',
    address: '7/5 Ground Floor, South Patel Nagar',
    state: 'National',
    district: 'Multi-district',
    village: 'National',
    latitude: 28.65,
    longitude: 77.17,
    services: 'Financial Inclusion, Health Insurance Facilitation, Artisan Skill Training',
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
  },
  {
    id: '3c4d5e6f-3333-4444-5555-666677778888',
    name: 'Gramin Aarogya Sahyog Foundation',
    description: 'Non-profit delivering mobile health camps, tele-consultation support, and generic medicine distribution in tribal villages.',
    category: 'Healthcare',
    phone: '9833445566',
    email: 'info@graminaarogya.org',
    website: 'https://graminaarogya.org',
    address: 'Near Tribal Welfare Office, Manor Road',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Palghar',
    latitude: 19.697,
    longitude: 72.77,
    services: 'Free Health Checkup Camps, Malnutrition Screening, Eyecare & Glasses',
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
  },
];

class NgoService {
  constructor() {
    this.client = supabaseAdmin || supabase;
  }

  getClient() {
    return supabaseAdmin || supabase;
  }

  /**
   * 1. GET ALL NGOs (with multi-criteria filtering, search, pagination, and geolocation)
   */
  async getNgos(options = {}) {
    const {
      category,
      district,
      state,
      village,
      service,
      search,
      is_active = true,
      lat,
      lng,
      radiusKm,
      limit = 20,
      offset = 0,
      sort = 'created_at',
      order = 'desc',
    } = options;

    const client = this.getClient();

    if (client) {
      try {
        let query = client.from(TABLES.NGOS).select('*');

        if (is_active !== null && is_active !== undefined) {
          query = query.eq('is_active', is_active === true || is_active === 'true');
        }

        if (category && category !== 'all') {
          query = query.ilike('category', `%${category.trim()}%`);
        }

        if (state) {
          query = query.ilike('state', `%${state.trim()}%`);
        }

        if (district) {
          query = query.ilike('district', `%${district.trim()}%`);
        }

        if (village) {
          query = query.ilike('village', `%${village.trim()}%`);
        }

        if (service) {
          query = query.ilike('services', `%${service.trim()}%`);
        }

        const ascending = order === 'asc';
        query = query.order(sort, { ascending });

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          let ngos = data;

          // Search term filter
          if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            ngos = ngos.filter((n) => {
              const matchesName = n.name && n.name.toLowerCase().includes(s);
              const matchesDesc = n.description && n.description.toLowerCase().includes(s);
              const matchesServices = n.services && n.services.toLowerCase().includes(s);
              const matchesAddress = n.address && n.address.toLowerCase().includes(s);
              const matchesVillage = n.village && n.village.toLowerCase().includes(s);
              const matchesDistrict = n.district && n.district.toLowerCase().includes(s);
              const matchesCategory = n.category && n.category.toLowerCase().includes(s);
              return matchesName || matchesDesc || matchesServices || matchesAddress || matchesVillage || matchesDistrict || matchesCategory;
            });
          }

          // Calculate distance if lat and lng provided
          if (lat != null && lng != null) {
            ngos = ngos.map((n) => ({
              ...n,
              distance_km: calculateDistanceKm(lat, lng, n.latitude, n.longitude),
            }));

            ngos.sort((a, b) => {
              if (a.distance_km == null) return 1;
              if (b.distance_km == null) return -1;
              return a.distance_km - b.distance_km;
            });

            if (radiusKm && !isNaN(Number(radiusKm))) {
              const maxRad = parseFloat(radiusKm);
              ngos = ngos.filter((n) => n.distance_km != null && n.distance_km <= maxRad);
            }
          }

          const total = ngos.length;
          const paginated = ngos.slice(Number(offset), Number(offset) + Number(limit));

          return {
            total,
            limit: Number(limit),
            offset: Number(offset),
            ngos: paginated,
          };
        }
      } catch (err) {
        logger.warn('Failed querying Supabase ngos, using fallback dataset:', err.message);
      }
    }

    // Fallback
    let fallback = JSON.parse(JSON.stringify(FALLBACK_NGOS));

    if (category && category !== 'all') {
      fallback = fallback.filter((n) => n.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (district) {
      fallback = fallback.filter((n) => n.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (village) {
      fallback = fallback.filter((n) => n.village.toLowerCase().includes(village.toLowerCase()));
    }
    if (service) {
      fallback = fallback.filter((n) => n.services.toLowerCase().includes(service.toLowerCase()));
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      fallback = fallback.filter(
        (n) => n.name.toLowerCase().includes(s) ||
               (n.description && n.description.toLowerCase().includes(s)) ||
               (n.services && n.services.toLowerCase().includes(s)) ||
               (n.village && n.village.toLowerCase().includes(s)) ||
               (n.district && n.district.toLowerCase().includes(s))
      );
    }
    if (lat != null && lng != null) {
      fallback = fallback.map((n) => ({
        ...n,
        distance_km: calculateDistanceKm(lat, lng, n.latitude, n.longitude),
      }));
      fallback.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
      if (radiusKm && !isNaN(Number(radiusKm))) {
        const maxRad = parseFloat(radiusKm);
        fallback = fallback.filter((n) => n.distance_km != null && n.distance_km <= maxRad);
      }
    }

    const total = fallback.length;
    const paginated = fallback.slice(Number(offset), Number(offset) + Number(limit));

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      ngos: paginated,
    };
  }

  /**
   * 2. GET NGO BY ID
   */
  async getNgoById(id) {
    if (!id) {
      const error = new Error('NGO ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        const { data, error } = await client
          .from(TABLES.NGOS)
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        logger.warn(`Error getting NGO ${id} from Supabase:`, err.message);
      }
    }

    // Check fallback
    const ngo = FALLBACK_NGOS.find((n) => n.id === id);
    if (!ngo) {
      const error = new Error(`NGO with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return ngo;
  }

  /**
   * 3. CREATE NGO
   */
  async createNgo(data) {
    const {
      name,
      description,
      category,
      phone,
      email,
      website,
      address,
      state,
      district,
      village,
      latitude,
      longitude,
      services,
      is_active = true,
    } = data;

    if (!name || !name.trim()) {
      const error = new Error('NGO name is required');
      error.statusCode = 400;
      throw error;
    }

    const ngoPayload = {
      name: name.trim(),
      description: description ? description.trim() : null,
      category: category ? category.trim() : 'General Rural Welfare',
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim().toLowerCase() : null,
      website: website ? String(website).trim() : null,
      address: address ? String(address).trim() : null,
      state: state ? String(state).trim() : null,
      district: district ? String(district).trim() : null,
      village: village ? String(village).trim() : null,
      latitude: latitude != null && !isNaN(Number(latitude)) ? parseFloat(latitude) : null,
      longitude: longitude != null && !isNaN(Number(longitude)) ? parseFloat(longitude) : null,
      services: services ? String(services).trim() : null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    };

    const client = this.getClient();

    if (!client) {
      const mockId = require('crypto').randomUUID();
      const mockNgo = {
        id: mockId,
        ...ngoPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      FALLBACK_NGOS.unshift(mockNgo);
      return mockNgo;
    }

    const { data: created, error } = await client
      .from(TABLES.NGOS)
      .insert(ngoPayload)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create NGO:', error.message);
      const err = new Error(`Failed to create NGO: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }

    return created;
  }

  /**
   * 4. UPDATE NGO
   */
  async updateNgo(id, data) {
    if (!id) {
      const error = new Error('NGO ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (!client) {
      const ngo = FALLBACK_NGOS.find((n) => n.id === id);
      if (!ngo) {
        const error = new Error(`NGO with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }
      Object.assign(ngo, data, { updated_at: new Date().toISOString() });
      return ngo;
    }

    // Verify existing
    const { data: existing, error: checkError } = await client
      .from(TABLES.NGOS)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError || !existing) {
      const error = new Error(`NGO with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const updatePayload = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updatePayload.name = String(data.name).trim();
    if (data.description !== undefined) updatePayload.description = data.description ? String(data.description).trim() : null;
    if (data.category !== undefined) updatePayload.category = data.category ? String(data.category).trim() : null;
    if (data.phone !== undefined) updatePayload.phone = data.phone ? String(data.phone).trim() : null;
    if (data.email !== undefined) updatePayload.email = data.email ? String(data.email).trim().toLowerCase() : null;
    if (data.website !== undefined) updatePayload.website = data.website ? String(data.website).trim() : null;
    if (data.address !== undefined) updatePayload.address = data.address ? String(data.address).trim() : null;
    if (data.state !== undefined) updatePayload.state = data.state ? String(data.state).trim() : null;
    if (data.district !== undefined) updatePayload.district = data.district ? String(data.district).trim() : null;
    if (data.village !== undefined) updatePayload.village = data.village ? String(data.village).trim() : null;
    if (data.latitude !== undefined) updatePayload.latitude = data.latitude != null ? parseFloat(data.latitude) : null;
    if (data.longitude !== undefined) updatePayload.longitude = data.longitude != null ? parseFloat(data.longitude) : null;
    if (data.services !== undefined) updatePayload.services = data.services ? String(data.services).trim() : null;
    if (data.is_active !== undefined) updatePayload.is_active = Boolean(data.is_active);

    const { data: updated, error: updateError } = await client
      .from(TABLES.NGOS)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      const error = new Error(`Failed to update NGO: ${updateError.message}`);
      error.statusCode = 500;
      throw error;
    }

    return updated;
  }

  /**
   * 5. DELETE NGO
   */
  async deleteNgo(id, hardDelete = false) {
    if (!id) {
      const error = new Error('NGO ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (!client) {
      const idx = FALLBACK_NGOS.findIndex((n) => n.id === id);
      if (idx === -1) {
        const error = new Error(`NGO with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }
      FALLBACK_NGOS.splice(idx, 1);
      return { id, deleted: true, mode: hardDelete ? 'hard' : 'soft' };
    }

    const { data: existing, error: checkError } = await client
      .from(TABLES.NGOS)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError || !existing) {
      const error = new Error(`NGO with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    if (hardDelete) {
      const { error: delError } = await client.from(TABLES.NGOS).delete().eq('id', id);
      if (delError) {
        const error = new Error(`Failed to delete NGO: ${delError.message}`);
        error.statusCode = 500;
        throw error;
      }
      return { id, deleted: true, mode: 'hard' };
    } else {
      const { error: softError } = await client
        .from(TABLES.NGOS)
        .update({ is_active: false })
        .eq('id', id);

      if (softError) {
        const error = new Error(`Failed to deactivate NGO: ${softError.message}`);
        error.statusCode = 500;
        throw error;
      }
      return { id, deactivated: true, mode: 'soft' };
    }
  }

  /**
   * 6. GET NGO CATEGORIES
   */
  async getCategories() {
    const client = this.getClient();
    let ngos = [];

    if (client) {
      const { data, error } = await client.from(TABLES.NGOS).select('category').eq('is_active', true);
      if (!error && Array.isArray(data)) {
        ngos = data;
      }
    }

    if (ngos.length === 0) {
      ngos = FALLBACK_NGOS;
    }

    const categoryCounts = {};
    ngos.forEach((n) => {
      const cat = n.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }

  /**
   * 7. GET NGO SUMMARY STATISTICS
   */
  async getStats() {
    const client = this.getClient();
    let ngos = [];

    if (client) {
      const { data, error } = await client.from(TABLES.NGOS).select('category, district, state, is_active');
      if (!error && Array.isArray(data)) {
        ngos = data;
      }
    }

    if (ngos.length === 0) {
      ngos = FALLBACK_NGOS;
    }

    const total = ngos.length;
    const activeCount = ngos.filter((n) => n.is_active !== false).length;
    const districts = new Set(ngos.map((n) => n.district).filter(Boolean));
    const categories = new Set(ngos.map((n) => n.category).filter(Boolean));

    return {
      total_ngos: total,
      active_ngos: activeCount,
      unique_districts_covered: districts.size,
      unique_categories: categories.size,
    };
  }
}

module.exports = new NgoService();
