const { sendSuccess, sendError } = require('../utils/response');
const healthcareService = require('../services/healthcare.service');

/**
 * Healthcare Controller
 * Structure:
 * Healthcare
 * ├── Hospitals (Human Healthcare facilities)
 * ├── Veterinary Hospitals (Animal Healthcare & Dispensaries)
 * └── Services (Clinical & Veterinary Services)
 */

// ============================================================================
// 1. GENERAL HEALTHCARE & GEOLOCATION ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/healthcare
 * List facilities (human & animal) with multi-criteria filtering
 * Query params: type (human/animal/all), state, district, village, is_emergency, search, service, lat, lng, radius, limit, offset
 */
const getFacilities = async (req, res, next) => {
  try {
    const {
      type,
      state,
      district,
      village,
      is_emergency,
      search,
      service,
      lat,
      lng,
      radius,
      limit,
      offset,
    } = req.query;

    const result = await healthcareService.getFacilities({
      type: type || 'all',
      state,
      district,
      village,
      is_emergency,
      search,
      service,
      lat,
      lng,
      radiusKm: radius,
      limit,
      offset,
    });

    return sendSuccess(res, result, 'Healthcare facilities retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/healthcare/nearby
 * Geolocation-based nearby search for healthcare and veterinary centers
 * Query params: lat, lng, radius (default 25 km), type, limit
 */
const getNearbyFacilities = async (req, res, next) => {
  try {
    const { lat, lng, radius, type, limit } = req.query;

    if (!lat || !lng) {
      return sendError(
        res,
        "Latitude ('lat') and Longitude ('lng') query parameters are required for nearby search",
        400
      );
    }

    const result = await healthcareService.getNearbyFacilities({
      lat,
      lng,
      radiusKm: radius || 25,
      type: type || 'all',
      limit: limit || 20,
    });

    return sendSuccess(res, result, 'Nearby healthcare facilities retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/healthcare/emergency
 * Emergency facilities and 24x7 helpline contacts (human 108/102/104 + animal 1962)
 * Query params: district, state, lat, lng, type
 */
const getEmergency = async (req, res, next) => {
  try {
    const { district, state, lat, lng, type } = req.query;

    const data = await healthcareService.getEmergencyData({
      district,
      state,
      lat,
      lng,
      type: type || 'all',
    });

    return sendSuccess(res, data, 'Emergency healthcare services retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/healthcare/:id
 * Retrieve facility by ID (backwards compatible with existing route)
 */
const getFacilityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facility = await healthcareService.getFacilityById(id);
    return sendSuccess(res, facility, 'Facility details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

// ============================================================================
// 2. HOSPITALS (HUMAN HEALTHCARE)
// ============================================================================

/**
 * GET /api/v1/healthcare/hospitals
 * Retrieve human hospitals, Primary Health Centres (PHCs), CHCs, and sub-district hospitals
 */
const getHospitals = async (req, res, next) => {
  try {
    const result = await healthcareService.getFacilities({
      ...req.query,
      type: 'human',
      radiusKm: req.query.radius,
    });
    return sendSuccess(res, result, 'Human hospitals retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/healthcare/hospitals/:id
 * Retrieve specific human hospital details with its services
 */
const getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hospital = await healthcareService.getFacilityById(id, 'human');
    return sendSuccess(res, hospital, 'Hospital details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * POST /api/v1/healthcare/hospitals
 * Create a new human healthcare facility
 */
const createHospital = async (req, res, next) => {
  try {
    const hospitalData = {
      ...req.body,
      type: 'human',
    };

    const created = await healthcareService.createFacility(hospitalData);
    return sendSuccess(res, created, 'Hospital created successfully', 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * PUT /api/v1/healthcare/hospitals/:id
 * Update hospital details
 */
const updateHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await healthcareService.updateFacility(id, req.body, 'human');
    return sendSuccess(res, updated, 'Hospital updated successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/healthcare/hospitals/:id
 * Delete or deactivate a hospital
 */
const deleteHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';
    const result = await healthcareService.deleteFacility(id, hardDelete, 'human');
    return sendSuccess(
      res,
      result,
      hardDelete ? 'Hospital permanently deleted' : 'Hospital deactivated successfully',
      200
    );
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

// ============================================================================
// 3. VETERINARY HOSPITALS (ANIMAL HEALTHCARE)
// ============================================================================

/**
 * GET /api/v1/healthcare/veterinary
 * Retrieve veterinary hospitals, polyclinics, and animal dispensaries
 */
const getVeterinaryHospitals = async (req, res, next) => {
  try {
    const result = await healthcareService.getFacilities({
      ...req.query,
      type: 'animal',
      radiusKm: req.query.radius,
    });
    return sendSuccess(res, result, 'Veterinary hospitals and dispensaries retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/healthcare/veterinary/:id
 * Retrieve specific veterinary hospital details with services
 */
const getVeterinaryHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vetHospital = await healthcareService.getFacilityById(id, 'animal');
    return sendSuccess(res, vetHospital, 'Veterinary hospital details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * POST /api/v1/healthcare/veterinary
 * Create a new veterinary hospital / dispensary
 */
const createVeterinaryHospital = async (req, res, next) => {
  try {
    const vetData = {
      ...req.body,
      type: 'animal',
    };

    const created = await healthcareService.createFacility(vetData);
    return sendSuccess(res, created, 'Veterinary hospital created successfully', 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * PUT /api/v1/healthcare/veterinary/:id
 * Update veterinary hospital
 */
const updateVeterinaryHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await healthcareService.updateFacility(id, req.body, 'animal');
    return sendSuccess(res, updated, 'Veterinary hospital updated successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/healthcare/veterinary/:id
 * Delete or deactivate veterinary hospital
 */
const deleteVeterinaryHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';
    const result = await healthcareService.deleteFacility(id, hardDelete, 'animal');
    return sendSuccess(
      res,
      result,
      hardDelete ? 'Veterinary hospital permanently deleted' : 'Veterinary hospital deactivated successfully',
      200
    );
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

// ============================================================================
// 4. HEALTHCARE & VETERINARY SERVICES
// ============================================================================

/**
 * GET /api/v1/healthcare/services
 * Retrieve services across all facilities (e.g. vaccination, OPD, anti-venom, artificial insemination)
 * Supports query params: hospital_id, facility_type (human/animal), search, available, district, state, limit, offset
 */
const getServices = async (req, res, next) => {
  try {
    const {
      hospital_id,
      facility_type,
      search,
      available,
      district,
      state,
      limit,
      offset,
    } = req.query;

    const result = await healthcareService.getServices({
      hospital_id,
      facility_type,
      search,
      available,
      district,
      state,
      limit,
      offset,
    });

    return sendSuccess(res, result, 'Healthcare services retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/healthcare/services/catalog
 * Curated knowledge base catalog of government rural healthcare & veterinary programs
 * Supports query param: category (human/animal/all)
 */
const getServicesCatalog = async (req, res, next) => {
  try {
    const { category } = req.query;
    const catalog = healthcareService.getServicesCatalog(category);
    return sendSuccess(res, catalog, 'Rural healthcare services catalog retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/healthcare/services/:id
 * Retrieve specific service with linked facility details
 */
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await healthcareService.getServiceById(id);
    return sendSuccess(res, service, 'Service details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * POST /api/v1/healthcare/services
 * Create a new service linked to a hospital or veterinary clinic
 * Body: { hospital_id, service_name, description, available }
 */
const createService = async (req, res, next) => {
  try {
    const created = await healthcareService.createService(req.body);
    return sendSuccess(res, created, 'Healthcare service created successfully', 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * PUT /api/v1/healthcare/services/:id
 * Update an existing healthcare service
 */
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await healthcareService.updateService(id, req.body);
    return sendSuccess(res, updated, 'Healthcare service updated successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/healthcare/services/:id
 * Delete a healthcare service
 */
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await healthcareService.deleteService(id);
    return sendSuccess(res, result, 'Healthcare service deleted successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * GET /api/v1/healthcare/hospitals/:id/services or /veterinary/:id/services
 * Retrieve all services of a specific facility
 */
const getFacilityServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await healthcareService.getServices({ hospital_id: id });
    return sendSuccess(res, result, 'Facility services retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/healthcare/hospitals/:id/services or /veterinary/:id/services
 * Add a service directly under a specific facility
 */
const addFacilityService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const created = await healthcareService.createService({
      ...req.body,
      hospital_id: id,
    });
    return sendSuccess(res, created, 'Service added to facility successfully', 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  // Common / Geolocation / Emergency
  getFacilities,
  getNearbyFacilities,
  getEmergency,
  getFacilityById,

  // Hospitals (Human)
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,

  // Veterinary Hospitals (Animal)
  getVeterinaryHospitals,
  getVeterinaryHospitalById,
  createVeterinaryHospital,
  updateVeterinaryHospital,
  deleteVeterinaryHospital,

  // Healthcare Services
  getServices,
  getServicesCatalog,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getFacilityServices,
  addFacilityService,
};
