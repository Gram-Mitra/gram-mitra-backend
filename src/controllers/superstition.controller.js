const { sendSuccess, sendError } = require('../utils/response');
const superstitionService = require('../services/superstition.service');

/**
 * Superstition / Myth vs Fact Controller
 * Hierarchy:
 * Superstition / Myth
 * └── Myth vs Fact
 *     ├── GET    /            - List myths vs facts (filters: category, language, search, verified, pagination)
 *     ├── GET    /categories  - List available myth categories and item counts
 *     ├── GET    /stats       - Aggregate metrics on recorded myths, verifications, and languages
 *     ├── GET    /random      - Get a random/featured myth vs fact (e.g. for Myth of the Day banner)
 *     ├── GET    /:id         - Detailed myth vs fact entry by UUID
 *     ├── POST   /            - Submit a new myth vs fact entry
 *     ├── PUT    /:id         - Update myth vs fact entry
 *     ├── DELETE /:id         - Remove a myth vs fact entry
 *     └── PATCH  /:id/verify  - Verify or update verification status with scientific authority source
 */

/**
 * GET /api/v1/superstitions
 * List myths vs facts with filtering, search, and pagination
 */
const getAllSuperstitions = async (req, res, next) => {
  try {
    const {
      category,
      language,
      search,
      is_verified,
      limit,
      offset,
      page,
      sort,
      order,
    } = req.query;

    const result = await superstitionService.getMyths({
      category,
      language,
      search,
      is_verified,
      limit,
      offset,
      page,
      sort,
      order,
    });

    return sendSuccess(res, result, 'Myths and facts retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/superstitions/categories
 * Retrieve distinct categories of myths with counts
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await superstitionService.getCategories();
    return sendSuccess(res, categories, 'Myth categories retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/superstitions/stats
 * Retrieve summary statistics on myths vs facts
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await superstitionService.getStats();
    return sendSuccess(res, stats, 'Myth statistics retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/superstitions/random
 * Retrieve a random or featured myth vs fact (e.g. for Myth of the Day)
 */
const getRandomSuperstition = async (req, res, next) => {
  try {
    const { category, language } = req.query;
    const myth = await superstitionService.getRandomMyth({ category, language });
    return sendSuccess(res, myth, 'Random myth vs fact retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * GET /api/v1/superstitions/:id
 * Retrieve a specific myth vs fact entry by ID
 */
const getSuperstitionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const myth = await superstitionService.getMythById(id);
    return sendSuccess(res, myth, 'Myth details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * POST /api/v1/superstitions
 * Create a new myth vs fact entry
 */
const createSuperstition = async (req, res, next) => {
  try {
    const created = await superstitionService.createMyth(req.body);
    return sendSuccess(res, created, 'Myth vs fact entry created successfully', 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * PUT /api/v1/superstitions/:id
 * Update an existing myth vs fact entry
 */
const updateSuperstition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await superstitionService.updateMyth(id, req.body);
    return sendSuccess(res, updated, 'Myth vs fact entry updated successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/superstitions/:id
 * Delete a myth vs fact entry
 */
const deleteSuperstition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await superstitionService.deleteMyth(id);
    return sendSuccess(res, result, 'Myth vs fact entry deleted successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * PATCH /api/v1/superstitions/:id/verify
 * Mark a myth vs fact as verified by medical or scientific authority
 */
const verifySuperstition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_verified = true, source } = req.body;
    const updated = await superstitionService.verifyMyth(id, is_verified, source);
    return sendSuccess(res, updated, 'Myth verification status updated successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getAllSuperstitions,
  getCategories,
  getStats,
  getRandomSuperstition,
  getSuperstitionById,
  createSuperstition,
  updateSuperstition,
  deleteSuperstition,
  verifySuperstition,
  // Aliases for compatibility
  getMyths: getAllSuperstitions,
  getMythById: getSuperstitionById,
  createMyth: createSuperstition,
  updateMyth: updateSuperstition,
  deleteMyth: deleteSuperstition,
};
