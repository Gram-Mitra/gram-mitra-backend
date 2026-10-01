const { sendSuccess, sendError } = require('../utils/response');
const ngoService = require('../services/ngo.service');

/**
 * NGOs Controller
 * Hierarchy:
 * NGOs
 * └── NGO Information (Directory, Contacts, Services, Location, Categories)
 */

/**
 * GET /api/v1/ngos
 * List verified rural NGOs with filtering, search, pagination, and geolocation
 */
const getNgos = async (req, res, next) => {
  try {
    const {
      category,
      district,
      state,
      village,
      service,
      search,
      lat,
      lng,
      radius,
      limit,
      offset,
      sort,
      order,
    } = req.query;

    const result = await ngoService.getNgos({
      category,
      district,
      state,
      village,
      service,
      search,
      lat,
      lng,
      radiusKm: radius,
      limit,
      offset,
      sort,
      order,
    });

    return sendSuccess(res, result, 'NGO directory retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/ngos/categories
 * Retrieve categories of NGOs and counts
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await ngoService.getCategories();
    return sendSuccess(res, categories, 'NGO categories retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/ngos/stats
 * Aggregate metrics on active NGOs and regional coverage
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await ngoService.getStats();
    return sendSuccess(res, stats, 'NGO statistics retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/ngos/:id
 * Retrieve detailed profile of a specific NGO
 */
const getNgoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ngo = await ngoService.getNgoById(id);
    return sendSuccess(res, ngo, 'NGO details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * POST /api/v1/ngos
 * Register a new partner NGO
 */
const createNgo = async (req, res, next) => {
  try {
    const created = await ngoService.createNgo(req.body);
    return sendSuccess(res, created, 'NGO registered successfully', 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * PUT /api/v1/ngos/:id
 * Update NGO profile information
 */
const updateNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await ngoService.updateNgo(id, req.body);
    return sendSuccess(res, updated, 'NGO information updated successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/ngos/:id
 * Deactivate or remove an NGO
 */
const deleteNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hard = req.query.hard === 'true';
    const result = await ngoService.deleteNgo(id, hard);
    return sendSuccess(
      res,
      result,
      hard ? 'NGO permanently deleted' : 'NGO deactivated successfully',
      200
    );
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getNgos,
  getNgoById,
  createNgo,
  updateNgo,
  deleteNgo,
  getCategories,
  getStats,
};
