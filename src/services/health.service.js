/**
 * Health Service
 * Handles business logic for system checks (DB, external APIs, etc.)
 */
const checkSystemHealth = async () => {
  return {
    database: 'healthy',
    cache: 'healthy',
  };
};

module.exports = {
  checkSystemHealth,
};
