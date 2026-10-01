const { supabase, supabaseAdmin, TABLES } = require('../config/supabase');
const logger = require('../utils/logger');

// Allowed categories matching SQL schema check constraint
const VALID_CATEGORIES = [
  'water',
  'road',
  'electricity',
  'agriculture',
  'healthcare',
  'sanitation',
  'animal',
  'other',
];

// Allowed statuses matching SQL schema check constraint
const VALID_STATUSES = [
  'reported',
  'under_review',
  'in_progress',
  'resolved',
  'rejected',
];

// Allowed priorities matching SQL schema check constraint
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

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
 * In-memory fallback dataset
 */
const FALLBACK_PROBLEMS = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    reported_by: '11111111-1111-1111-1111-111111111111',
    title: 'Leaking Main Water Supply Pipe',
    description: 'The primary water pipeline near ZP School is damaged and leaking heavily, lowering water pressure.',
    category: 'water',
    image_url: null,
    latitude: 19.5771,
    longitude: 72.8234,
    village: 'Saphale',
    district: 'Palghar',
    status: 'in_progress',
    priority: 'high',
    assigned_to: null,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
    resolved_at: null,
    reporter: {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Ramesh Patil',
      phone: '9876543210',
    },
    updates: [
      {
        id: '0c18fb5e-6e79-4b2e-951c-6a699a3fd835',
        problem_id: '55555555-5555-5555-5555-555555555555',
        updated_by: '11111111-1111-1111-1111-111111111111',
        status: 'reported',
        comment: 'Problem registered by Ramesh Patil.',
        image_url: null,
        created_at: '2026-09-29T15:09:22.355Z',
      },
      {
        id: 'e31cbf0d-0ca4-4592-95a6-5987e4c1f7cf',
        problem_id: '55555555-5555-5555-5555-555555555555',
        updated_by: '11111111-1111-1111-1111-111111111111',
        status: 'under_review',
        comment: 'Gram Panchayat representative reviewed the site.',
        image_url: null,
        created_at: '2026-09-29T15:30:00.000Z',
      },
      {
        id: '85664d4c-c0fa-4b0c-98cb-290ee4674fa8',
        problem_id: '55555555-5555-5555-5555-555555555555',
        updated_by: '11111111-1111-1111-1111-111111111111',
        status: 'in_progress',
        comment: 'Plumbing team dispatched. Expected repair by tomorrow afternoon.',
        image_url: null,
        created_at: '2026-09-29T16:00:00.000Z',
      },
    ],
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    reported_by: '22222222-2222-2222-2222-222222222222',
    title: 'Broken Streetlights on Market Road',
    description: 'Three streetlights have been out for over a week, making night travel unsafe.',
    category: 'electricity',
    image_url: null,
    latitude: 19.6102,
    longitude: 72.7351,
    village: 'Kelve',
    district: 'Palghar',
    status: 'reported',
    priority: 'medium',
    assigned_to: null,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
    resolved_at: null,
    reporter: {
      id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Suresh Kumar',
      phone: '9822334455',
    },
    updates: [
      {
        id: '270c27ac-4bf1-4fb6-ad91-c302201ba52a',
        problem_id: '66666666-6666-6666-6666-666666666666',
        updated_by: '22222222-2222-2222-2222-222222222222',
        status: 'reported',
        comment: 'Problem registered by Suresh Kumar.',
        image_url: null,
        created_at: '2026-09-29T15:09:22.355Z',
      },
    ],
  },
];

class ProblemService {
  constructor() {
    this.client = supabaseAdmin || supabase;
  }

  getClient() {
    return supabaseAdmin || supabase;
  }

  /**
   * 1. CREATE PROBLEM
   * Inserts new village problem and creates initial history entry
   */
  async createProblem(data, user = null) {
    const {
      title,
      description,
      category,
      image_url,
      latitude,
      longitude,
      village,
      district,
      priority = 'medium',
      reported_by,
      initial_comment,
    } = data;

    // Validation
    if (!title || !title.trim() || title.trim().length < 3) {
      const error = new Error('Problem title is required and must be at least 3 characters');
      error.statusCode = 400;
      throw error;
    }

    if (!category || !VALID_CATEGORIES.includes(category.trim().toLowerCase())) {
      const error = new Error(
        `Invalid category '${category}'. Valid categories are: ${VALID_CATEGORIES.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    const cleanPriority = priority ? priority.trim().toLowerCase() : 'medium';
    if (!VALID_PRIORITIES.includes(cleanPriority)) {
      const error = new Error(
        `Invalid priority '${priority}'. Valid priorities are: ${VALID_PRIORITIES.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    // Determine reporter ID
    let reporterId = user?.id || reported_by || null;
    if (reporterId && !isValidUUID(reporterId)) {
      reporterId = null;
    }

    const problemPayload = {
      title: title.trim(),
      description: description ? description.trim() : null,
      category: category.trim().toLowerCase(),
      image_url: image_url ? image_url.trim() : null,
      latitude: latitude != null && !isNaN(Number(latitude)) ? parseFloat(latitude) : null,
      longitude: longitude != null && !isNaN(Number(longitude)) ? parseFloat(longitude) : null,
      village: village ? village.trim() : null,
      district: district ? district.trim() : null,
      status: 'reported',
      priority: cleanPriority,
      reported_by: reporterId,
    };

    const client = this.getClient();

    if (!client) {
      const mockId = require('crypto').randomUUID();
      const mockProblem = {
        id: mockId,
        ...problemPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: null,
        reporter: null,
        updates: [
          {
            id: require('crypto').randomUUID(),
            problem_id: mockId,
            updated_by: reporterId,
            status: 'reported',
            comment: initial_comment || 'Problem reported by citizen.',
            image_url: problemPayload.image_url,
            created_at: new Date().toISOString(),
          },
        ],
      };
      FALLBACK_PROBLEMS.unshift(mockProblem);
      return mockProblem;
    }

    // Insert into Supabase village_problems
    const { data: createdProblem, error: insertError } = await client
      .from(TABLES.VILLAGE_PROBLEMS)
      .insert(problemPayload)
      .select('*, reporter:profiles!reported_by(id, full_name, phone)')
      .single();

    if (insertError) {
      logger.error('Failed to create village problem:', insertError.message);
      const error = new Error(`Failed to create problem: ${insertError.message}`);
      error.statusCode = 500;
      throw error;
    }

    // Create initial entry in problem_updates
    const initialUpdatePayload = {
      problem_id: createdProblem.id,
      updated_by: reporterId,
      status: 'reported',
      comment: initial_comment ? initial_comment.trim() : 'Problem reported by citizen.',
      image_url: problemPayload.image_url,
    };

    const { data: initialUpdate, error: updateError } = await client
      .from(TABLES.PROBLEM_UPDATES)
      .insert(initialUpdatePayload)
      .select('*, updater:profiles!updated_by(id, full_name, phone)')
      .single();

    if (updateError) {
      logger.warn('Could not insert initial problem update history:', updateError.message);
    }

    return {
      ...createdProblem,
      updates: initialUpdate ? [initialUpdate] : [],
    };
  }

  /**
   * 2. VIEW PROBLEMS
   * Query problems with multi-attribute filtering, search, pagination, and geolocation
   */
  async getProblems(options = {}) {
    const {
      category,
      status,
      priority,
      village,
      district,
      reported_by,
      assigned_to,
      search,
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
        let query = client
          .from(TABLES.VILLAGE_PROBLEMS)
          .select('*, reporter:profiles!reported_by(id, full_name, phone), updates:problem_updates(*)');

        if (category && category !== 'all') {
          query = query.eq('category', category.trim().toLowerCase());
        }

        if (status && status !== 'all') {
          query = query.eq('status', status.trim().toLowerCase());
        }

        if (priority && priority !== 'all') {
          query = query.eq('priority', priority.trim().toLowerCase());
        }

        if (district) {
          query = query.ilike('district', `%${district.trim()}%`);
        }

        if (village) {
          query = query.ilike('village', `%${village.trim()}%`);
        }

        if (reported_by && isValidUUID(reported_by)) {
          query = query.eq('reported_by', reported_by);
        }

        if (assigned_to && isValidUUID(assigned_to)) {
          query = query.eq('assigned_to', assigned_to);
        }

        const ascending = order === 'asc';
        query = query.order(sort, { ascending });

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          let problems = data;

          // Free text search in title, description, village, or district
          if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            problems = problems.filter((p) => {
              const inTitle = p.title && p.title.toLowerCase().includes(s);
              const inDesc = p.description && p.description.toLowerCase().includes(s);
              const inVillage = p.village && p.village.toLowerCase().includes(s);
              const inDistrict = p.district && p.district.toLowerCase().includes(s);
              return inTitle || inDesc || inVillage || inDistrict;
            });
          }

          // Geolocation calculation and filtering
          if (lat != null && lng != null) {
            problems = problems.map((p) => ({
              ...p,
              distance_km: calculateDistanceKm(lat, lng, p.latitude, p.longitude),
            }));

            // Sort by nearest first
            problems.sort((a, b) => {
              if (a.distance_km == null) return 1;
              if (b.distance_km == null) return -1;
              return a.distance_km - b.distance_km;
            });

            if (radiusKm && !isNaN(Number(radiusKm))) {
              const maxRad = parseFloat(radiusKm);
              problems = problems.filter((p) => p.distance_km != null && p.distance_km <= maxRad);
            }
          }

          const total = problems.length;
          const paginated = problems.slice(Number(offset), Number(offset) + Number(limit));

          return {
            total,
            limit: Number(limit),
            offset: Number(offset),
            problems: paginated,
          };
        }
      } catch (err) {
        logger.warn('Failed querying Supabase village_problems, falling back to local dataset:', err.message);
      }
    }

    // Fallback in-memory
    let fallback = JSON.parse(JSON.stringify(FALLBACK_PROBLEMS));

    if (category && category !== 'all') {
      fallback = fallback.filter((p) => p.category === category.toLowerCase());
    }
    if (status && status !== 'all') {
      fallback = fallback.filter((p) => p.status === status.toLowerCase());
    }
    if (priority && priority !== 'all') {
      fallback = fallback.filter((p) => p.priority === priority.toLowerCase());
    }
    if (district) {
      fallback = fallback.filter((p) => p.district && p.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (village) {
      fallback = fallback.filter((p) => p.village && p.village.toLowerCase().includes(village.toLowerCase()));
    }
    if (reported_by) {
      fallback = fallback.filter((p) => p.reported_by === reported_by);
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      fallback = fallback.filter(
        (p) => (p.title && p.title.toLowerCase().includes(s)) ||
               (p.description && p.description.toLowerCase().includes(s)) ||
               (p.village && p.village.toLowerCase().includes(s)) ||
               (p.district && p.district.toLowerCase().includes(s))
      );
    }
    if (lat != null && lng != null) {
      fallback = fallback.map((p) => ({
        ...p,
        distance_km: calculateDistanceKm(lat, lng, p.latitude, p.longitude),
      }));
      fallback.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
      if (radiusKm && !isNaN(Number(radiusKm))) {
        const maxRad = parseFloat(radiusKm);
        fallback = fallback.filter((p) => p.distance_km != null && p.distance_km <= maxRad);
      }
    }

    const total = fallback.length;
    const paginated = fallback.slice(Number(offset), Number(offset) + Number(limit));

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      problems: paginated,
    };
  }

  /**
   * 2b. VIEW SINGLE PROBLEM BY ID
   */
  async getProblemById(id) {
    if (!id) {
      const error = new Error('Problem ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        const { data, error } = await client
          .from(TABLES.VILLAGE_PROBLEMS)
          .select('*, reporter:profiles!reported_by(id, full_name, phone, village, district), assignee:profiles!assigned_to(id, full_name, phone), updates:problem_updates(*, updater:profiles!updated_by(id, full_name, phone))')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          // Sort timeline updates chronologically
          if (Array.isArray(data.updates)) {
            data.updates.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          }
          return data;
        }
      } catch (err) {
        logger.warn(`Error getting problem ${id} from Supabase:`, err.message);
      }
    }

    // Check fallback
    const fallback = FALLBACK_PROBLEMS.find((p) => p.id === id);
    if (!fallback) {
      const error = new Error(`Village problem with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return fallback;
  }

  /**
   * 3. UPDATE STATUS
   * Updates problem status, records timeline entry in problem_updates, and handles resolved_at
   */
  async updateProblemStatus(id, updateData, user = null) {
    if (!id) {
      const error = new Error('Problem ID is required');
      error.statusCode = 400;
      throw error;
    }

    const { status, comment, image_url, assigned_to } = updateData;

    if (!status || !VALID_STATUSES.includes(status.trim().toLowerCase())) {
      const error = new Error(
        `Invalid status '${status}'. Allowed statuses are: ${VALID_STATUSES.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    const cleanStatus = status.trim().toLowerCase();
    const updaterId = user?.id || updateData.updated_by || null;
    const client = this.getClient();

    if (!client) {
      const problem = FALLBACK_PROBLEMS.find((p) => p.id === id);
      if (!problem) {
        const error = new Error(`Problem with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }
      problem.status = cleanStatus;
      problem.updated_at = new Date().toISOString();
      if (cleanStatus === 'resolved') {
        problem.resolved_at = new Date().toISOString();
      } else {
        problem.resolved_at = null;
      }
      if (assigned_to !== undefined) {
        problem.assigned_to = assigned_to;
      }

      const updateRecord = {
        id: require('crypto').randomUUID(),
        problem_id: id,
        updated_by: updaterId,
        status: cleanStatus,
        comment: comment ? comment.trim() : `Status changed to ${cleanStatus}`,
        image_url: image_url || null,
        created_at: new Date().toISOString(),
      };
      problem.updates.push(updateRecord);

      return {
        problem,
        new_update: updateRecord,
      };
    }

    // Check problem exists
    const { data: existing, error: checkError } = await client
      .from(TABLES.VILLAGE_PROBLEMS)
      .select('id, status')
      .eq('id', id)
      .maybeSingle();

    if (checkError || !existing) {
      const error = new Error(`Village problem with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Prepare update payload
    const updatePayload = {
      status: cleanStatus,
      updated_at: new Date().toISOString(),
    };

    if (cleanStatus === 'resolved') {
      updatePayload.resolved_at = new Date().toISOString();
    } else {
      updatePayload.resolved_at = null;
    }

    if (assigned_to !== undefined) {
      updatePayload.assigned_to = assigned_to && isValidUUID(assigned_to) ? assigned_to : null;
    }

    // 1. Update village_problems
    const { data: updatedProblem, error: probUpdateError } = await client
      .from(TABLES.VILLAGE_PROBLEMS)
      .update(updatePayload)
      .eq('id', id)
      .select('*, reporter:profiles!reported_by(id, full_name, phone)')
      .single();

    if (probUpdateError) {
      const error = new Error(`Failed to update problem status: ${probUpdateError.message}`);
      error.statusCode = 500;
      throw error;
    }

    // 2. Insert into problem_updates history
    const historyPayload = {
      problem_id: id,
      updated_by: updaterId && isValidUUID(updaterId) ? updaterId : null,
      status: cleanStatus,
      comment: comment ? comment.trim() : `Status updated to ${cleanStatus}`,
      image_url: image_url ? image_url.trim() : null,
    };

    const { data: createdHistory, error: historyError } = await client
      .from(TABLES.PROBLEM_UPDATES)
      .insert(historyPayload)
      .select('*, updater:profiles!updated_by(id, full_name, phone)')
      .single();

    if (historyError) {
      logger.warn('Failed inserting problem_updates record:', historyError.message);
    }

    // 3. Fetch all updates for complete timeline
    const { data: allUpdates } = await client
      .from(TABLES.PROBLEM_UPDATES)
      .select('*, updater:profiles!updated_by(id, full_name, phone)')
      .eq('problem_id', id)
      .order('created_at', { ascending: true });

    return {
      problem: {
        ...updatedProblem,
        updates: allUpdates || [],
      },
      new_update: createdHistory || historyPayload,
    };
  }

  /**
   * 4. PROBLEM HISTORY
   * Retrieve full timeline history for a specific problem
   */
  async getProblemHistory(id) {
    if (!id) {
      const error = new Error('Problem ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        // Verify problem exists
        const { data: problem, error: probError } = await client
          .from(TABLES.VILLAGE_PROBLEMS)
          .select('id, title, status, category, village, district, created_at, resolved_at')
          .eq('id', id)
          .maybeSingle();

        if (probError || !problem) {
          const error = new Error(`Village problem with ID '${id}' not found`);
          error.statusCode = 404;
          throw error;
        }

        // Fetch updates
        const { data: updates, error: histError } = await client
          .from(TABLES.PROBLEM_UPDATES)
          .select('*, updater:profiles!updated_by(id, full_name, phone)')
          .eq('problem_id', id)
          .order('created_at', { ascending: true });

        if (!histError) {
          return {
            problem_id: id,
            problem,
            total_updates: updates.length,
            history: updates,
          };
        }
      } catch (err) {
        logger.warn(`Error getting history for problem ${id}:`, err.message);
      }
    }

    // Fallback
    const problem = FALLBACK_PROBLEMS.find((p) => p.id === id);
    if (!problem) {
      const error = new Error(`Village problem with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return {
      problem_id: id,
      problem: {
        id: problem.id,
        title: problem.title,
        status: problem.status,
        category: problem.category,
        village: problem.village,
        district: problem.district,
        created_at: problem.created_at,
        resolved_at: problem.resolved_at,
      },
      total_updates: problem.updates.length,
      history: problem.updates,
    };
  }

  /**
   * Update problem details (title, description, category, priority, etc.)
   */
  async updateProblem(id, data, user = null) {
    if (!id) {
      const error = new Error('Problem ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();
    if (!client) {
      const problem = FALLBACK_PROBLEMS.find((p) => p.id === id);
      if (!problem) {
        const error = new Error(`Problem with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }
      Object.assign(problem, data, { updated_at: new Date().toISOString() });
      return problem;
    }

    // Check existing
    const { data: existing, error: checkError } = await client
      .from(TABLES.VILLAGE_PROBLEMS)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (checkError || !existing) {
      const error = new Error(`Village problem with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const updatePayload = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) updatePayload.title = String(data.title).trim();
    if (data.description !== undefined) updatePayload.description = data.description ? String(data.description).trim() : null;
    if (data.category !== undefined) {
      const cat = String(data.category).trim().toLowerCase();
      if (!VALID_CATEGORIES.includes(cat)) {
        const error = new Error(`Invalid category '${cat}'`);
        error.statusCode = 400;
        throw error;
      }
      updatePayload.category = cat;
    }
    if (data.priority !== undefined) {
      const prio = String(data.priority).trim().toLowerCase();
      if (!VALID_PRIORITIES.includes(prio)) {
        const error = new Error(`Invalid priority '${prio}'`);
        error.statusCode = 400;
        throw error;
      }
      updatePayload.priority = prio;
    }
    if (data.image_url !== undefined) updatePayload.image_url = data.image_url ? String(data.image_url).trim() : null;
    if (data.latitude !== undefined) updatePayload.latitude = data.latitude != null ? parseFloat(data.latitude) : null;
    if (data.longitude !== undefined) updatePayload.longitude = data.longitude != null ? parseFloat(data.longitude) : null;
    if (data.village !== undefined) updatePayload.village = data.village ? String(data.village).trim() : null;
    if (data.district !== undefined) updatePayload.district = data.district ? String(data.district).trim() : null;
    if (data.assigned_to !== undefined) {
      updatePayload.assigned_to = data.assigned_to && isValidUUID(data.assigned_to) ? data.assigned_to : null;
    }

    // If status changed as well
    if (data.status !== undefined && data.status !== existing.status) {
      const newStatus = String(data.status).trim().toLowerCase();
      if (!VALID_STATUSES.includes(newStatus)) {
        const error = new Error(`Invalid status '${newStatus}'`);
        error.statusCode = 400;
        throw error;
      }
      updatePayload.status = newStatus;
      if (newStatus === 'resolved') {
        updatePayload.resolved_at = new Date().toISOString();
      } else {
        updatePayload.resolved_at = null;
      }

      // Record update history
      await client.from(TABLES.PROBLEM_UPDATES).insert({
        problem_id: id,
        updated_by: user?.id || null,
        status: newStatus,
        comment: data.comment ? data.comment.trim() : `Status updated to ${newStatus}`,
      });
    }

    const { data: updated, error: updateError } = await client
      .from(TABLES.VILLAGE_PROBLEMS)
      .update(updatePayload)
      .eq('id', id)
      .select('*, reporter:profiles!reported_by(id, full_name, phone), updates:problem_updates(*)')
      .single();

    if (updateError) {
      const error = new Error(`Failed to update problem: ${updateError.message}`);
      error.statusCode = 500;
      throw error;
    }

    return updated;
  }

  /**
   * Delete a problem and cascade delete its updates
   */
  async deleteProblem(id) {
    if (!id) {
      const error = new Error('Problem ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();
    if (!client) {
      const idx = FALLBACK_PROBLEMS.findIndex((p) => p.id === id);
      if (idx === -1) {
        const error = new Error(`Village problem with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }
      FALLBACK_PROBLEMS.splice(idx, 1);
      return { id, deleted: true };
    }

    // Check existence
    const { data: existing, error: checkError } = await client
      .from(TABLES.VILLAGE_PROBLEMS)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError || !existing) {
      const error = new Error(`Village problem with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Delete updates first (schema has ON DELETE CASCADE, but explicit ensures clean execution)
    await client.from(TABLES.PROBLEM_UPDATES).delete().eq('problem_id', id);

    const { error: delError } = await client
      .from(TABLES.VILLAGE_PROBLEMS)
      .delete()
      .eq('id', id);

    if (delError) {
      const error = new Error(`Failed to delete problem: ${delError.message}`);
      error.statusCode = 500;
      throw error;
    }

    return { id, deleted: true };
  }

  /**
   * Get village problem summary statistics (counts by status, category, resolution rate)
   */
  async getProblemStats(options = {}) {
    const { district, village } = options;
    const client = this.getClient();

    let problems = [];

    if (client) {
      let query = client.from(TABLES.VILLAGE_PROBLEMS).select('id, status, category, priority, created_at, resolved_at');
      if (district) query = query.ilike('district', `%${district.trim()}%`);
      if (village) query = query.ilike('village', `%${village.trim()}%`);
      const { data, error } = await query;
      if (!error && data) {
        problems = data;
      }
    }

    if (problems.length === 0) {
      problems = FALLBACK_PROBLEMS;
      if (district) {
        problems = problems.filter((p) => p.district.toLowerCase().includes(district.toLowerCase()));
      }
      if (village) {
        problems = problems.filter((p) => p.village.toLowerCase().includes(village.toLowerCase()));
      }
    }

    const byStatus = {
      reported: 0,
      under_review: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };

    const byCategory = {};
    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    problems.forEach((p) => {
      if (byStatus[p.status] !== undefined) byStatus[p.status]++;
      if (!byCategory[p.category]) byCategory[p.category] = 0;
      byCategory[p.category]++;
      if (byPriority[p.priority] !== undefined) byPriority[p.priority]++;
    });

    const total = problems.length;
    const resolvedCount = byStatus.resolved;
    const resolutionRatePercent = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

    return {
      total_problems: total,
      resolution_rate_percent: resolutionRatePercent,
      by_status: byStatus,
      by_category: byCategory,
      by_priority: byPriority,
    };
  }

  getCategories() {
    return VALID_CATEGORIES;
  }

  getStatuses() {
    return VALID_STATUSES;
  }

  getPriorities() {
    return VALID_PRIORITIES;
  }
}

module.exports = new ProblemService();
