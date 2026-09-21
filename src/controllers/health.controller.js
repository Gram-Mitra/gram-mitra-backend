const config = require('../config');

/**
 * Health Check Controller
 * Meets exact requirement: Returns status: "OK"
 */
const getHealth = (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: config.appName,
    environment: config.nodeEnv,
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
