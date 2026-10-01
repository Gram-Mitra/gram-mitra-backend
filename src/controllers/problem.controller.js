const { sendSuccess, sendError } = require('../utils/response');
const problemService = require('../services/problem.service');

/**
 * Village Problems Controller
 * Hierarchy:
 * Village Problems
 * ├── Create problem
 * ├── View problems
 * ├── Update status
 * └── Problem history
 */

/**
 * 1. CREATE PROBLEM
 * POST /api/v1/village-problems
 * Citizen or official registers a village civic/infrastructure/healthcare issue
 */
const reportProblem = async (req, res, next) => {
  try {
    const created = await problemService.createProblem(req.body, req.user);
    return sendSuccess(res, created, 'Village problem reported successfully', 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * 2. VIEW PROBLEMS
 * GET /api/v1/village-problems
 * Query and filter problems with search, pagination, and geolocation
 */
const getProblems = async (req, res, next) => {
  try {
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
      radius,
      limit,
      offset,
      sort,
      order,
    } = req.query;

    const result = await problemService.getProblems({
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
      radiusKm: radius,
      limit,
      offset,
      sort,
      order,
    });

    return sendSuccess(res, result, 'Village problems retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * 2b. VIEW PROBLEM BY ID
 * GET /api/v1/village-problems/:id
 * Retrieve details of a specific problem with reporter and updates
 */
const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const problem = await problemService.getProblemById(id);
    return sendSuccess(res, problem, 'Problem details retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * 3. UPDATE STATUS
 * PATCH /api/v1/village-problems/:id/status
 * or POST /api/v1/village-problems/:id/updates
 * Transition status (reported -> under_review -> in_progress -> resolved -> rejected)
 * with mandatory or optional status transition note/comment and proof photo
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await problemService.updateProblemStatus(id, req.body, req.user);
    return sendSuccess(res, result, `Problem status updated to '${req.body.status}'`, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * 4. PROBLEM HISTORY
 * GET /api/v1/village-problems/:id/history
 * or GET /api/v1/village-problems/:id/updates
 * Full chronological timeline and audit trail of changes made to the problem
 */
const getProblemHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await problemService.getProblemHistory(id);
    return sendSuccess(res, history, 'Problem update history retrieved successfully', 200);
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

/**
 * PUT /api/v1/village-problems/:id
 * Full update of problem details
 */
const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await problemService.updateProblem(id, req.body, req.user);
    return sendSuccess(res, updated, 'Problem updated successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/village-problems/:id
 * Delete a problem
 */
const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await problemService.deleteProblem(id);
    return sendSuccess(res, result, 'Problem deleted successfully', 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * GET /api/v1/village-problems/stats
 * Aggregate metrics and resolution percentage
 */
const getProblemStats = async (req, res, next) => {
  try {
    const { district, village } = req.query;
    const stats = await problemService.getProblemStats({ district, village });
    return sendSuccess(res, stats, 'Village problem statistics computed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/village-problems/metadata
 * Returns valid categories, statuses, and priorities for UI dropdowns
 */
const getProblemMetadata = (req, res) => {
  return sendSuccess(
    res,
    {
      categories: problemService.getCategories(),
      statuses: problemService.getStatuses(),
      priorities: problemService.getPriorities(),
    },
    'Village problem metadata retrieved successfully',
    200
  );
};

module.exports = {
  reportProblem,
  getProblems,
  getProblemById,
  updateStatus,
  getProblemHistory,
  updateProblem,
  deleteProblem,
  getProblemStats,
  getProblemMetadata,
};
