require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Gram Mitra Backend',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'gram_mitra_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  dataGov: {
    apiKey: process.env.DATA_GOV_API_KEY || '',
    baseUrl: process.env.DATA_GOV_BASE_URL || 'https://api.data.gov.in/resource',
    resourceId: process.env.DATA_GOV_RESOURCE_ID || '388208c6-d82a-4190-90df-91aa2c326fec',
    cacheTtlMs: parseInt(process.env.DATA_GOV_CACHE_TTL_MS, 10) || 10 * 60 * 1000, // 10 minutes default
  },
};

module.exports = config;
