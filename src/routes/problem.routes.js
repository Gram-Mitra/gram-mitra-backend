const express = require('express');
const {
  reportProblem,
  getProblems,
  getProblemById,
  updateStatus,
  getProblemHistory,
  updateProblem,
  deleteProblem,
  getProblemStats,
  getProblemMetadata,
} = require('../controllers/problem.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Village Problems API Routes Hierarchy:
 *
 * Village Problems (/api/v1/village-problems)
 * │
 * ├── Create problem
 * │   └── POST   /                  - Report a new village civic/infrastructure issue
 * │
 * ├── View problems
 * │   ├── GET    /                  - List problems (filters: category, status, priority, district, village, search, lat, lng, radius)
 * │   ├── GET    /stats             - Summary analytics (counts by status, category, resolution rate)
 * │   ├── GET    /metadata          - Dropdown values (categories, statuses, priorities)
 * │   └── GET    /:id               - Specific problem profile with reporter and updates
 * │
 * ├── Update status
 * │   ├── PATCH  /:id/status        - Update problem status (reported -> under_review -> in_progress -> resolved -> rejected)
 * │   ├── POST   /:id/updates       - Add a status transition update with comment & proof photo
 * │   └── PUT    /:id               - Update problem full details
 * │
 * └── Problem history
 *     ├── GET    /:id/history       - Full chronological audit history of status changes
 *     └── GET    /:id/updates       - Alias for problem timeline updates
 *
 * Delete problem
 * └── DELETE /:id                   - Delete problem and cascade remove updates
 */

// 1. Static query endpoints (before :id routes)
router.get('/stats', getProblemStats);
router.get('/metadata', getProblemMetadata);

// 2. Collection endpoints
router.post('/', optionalAuth, reportProblem);
router.get('/', getProblems);

// 3. Status updates & History sub-routes
router.patch('/:id/status', optionalAuth, updateStatus);
router.post('/:id/updates', optionalAuth, updateStatus);
router.get('/:id/history', getProblemHistory);
router.get('/:id/updates', getProblemHistory);

// 4. Resource item endpoints
router.get('/:id', getProblemById);
router.put('/:id', optionalAuth, updateProblem);
router.delete('/:id', optionalAuth, deleteProblem);

module.exports = router;
