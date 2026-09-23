const { sendSuccess, sendError } = require('../utils/response');
const schemeService = require('../services/scheme.service');

/**
 * 5. NGO and Government Schemes Controller
 * Supports live data.gov.in PM-KISAN beneficiary records, scheme directory catalog, and NGO contacts.
 */

/**
 * GET /api/v1/schemes
 * Primary endpoint for government schemes data from data.gov.in
 * Supports query params: limit, offset, state, district, subDistrict, block, village, search, refresh
 */
const getSchemes = async (req, res, next) => {
  try {
    const data = await schemeService.fetchGovSchemesData(req.query);
    return sendSuccess(res, data, 'Government schemes data fetched successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/schemes/catalog
 * Curated list of major rural development and farmer welfare schemes in India
 */
const getSchemesCatalog = async (req, res, next) => {
  try {
    const catalog = schemeService.getRuralSchemesCatalog();
    return sendSuccess(res, catalog, 'Rural government schemes catalog fetched successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/schemes/stats
 * Aggregate beneficiary metrics and counts
 */
const getSchemeStats = async (req, res, next) => {
  try {
    const data = await schemeService.fetchGovSchemesData({ ...req.query, limit: 100 });
    return sendSuccess(
      res,
      {
        metadata: data.metadata,
        summary: data.summary,
      },
      'Scheme statistics computed successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/schemes/:id
 * Retrieve specific scheme information by ID or slug (e.g. pm-kisan)
 */
const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await schemeService.getSchemeById(req.params.id);
    if (!scheme) {
      return sendError(res, `Scheme with ID '${req.params.id}' not found`, 404);
    }
    return sendSuccess(res, scheme, 'Scheme details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/schemes/ngos
 * Retrieve partner NGOs helping rural citizens with schemes
 */
const getNgos = async (req, res, next) => {
  try {
    const ngos = schemeService.getNgos();
    return sendSuccess(res, ngos, 'NGOs list fetched successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemes,
  getSchemesCatalog,
  getSchemeStats,
  getSchemeById,
  getNgos,
};
