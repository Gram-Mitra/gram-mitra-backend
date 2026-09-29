const config = require('../config');
const { isSupabaseConfigured, testConnection } = require('../config/supabase');

/**
 * Health Check Controller
 * Meets exact requirement: Returns status: "OK" along with database status
 */
const getHealth = async (req, res) => {
  let dbStatus = 'Not Configured';

  if (isSupabaseConfigured) {
    const conn = await testConnection();
    dbStatus = conn.connected ? 'Connected' : 'Disconnected';
  }

  res.status(200).json({
    status: 'OK',
    service: config.appName,
    environment: config.nodeEnv,
    database: {
      type: 'Supabase (PostgreSQL)',
      status: dbStatus,
    },
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
