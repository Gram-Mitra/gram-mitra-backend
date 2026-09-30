const { createClient } = require('@supabase/supabase-js');
const config = require('./index');
const logger = require('../utils/logger');

// Clean and sanitize inputs (strip quotes and whitespace from CI/Jenkins environment variables)
const sanitizeEnv = (val) => {
  if (!val) return '';
  let str = String(val).trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
};

let rawUrl = sanitizeEnv(config.supabase.url);
// Auto-prepend https:// if domain was provided without protocol (e.g. idawmapnmtapmkxotzlw.supabase.co)
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  if (rawUrl.includes('.')) {
    rawUrl = `https://${rawUrl}`;
  }
}

// Validate URL format
let supabaseUrl = '';
try {
  if (rawUrl && rawUrl !== 'https://your-project-id.supabase.co') {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      supabaseUrl = rawUrl;
    }
  }
} catch {
  supabaseUrl = '';
}

const supabaseAnonKey = sanitizeEnv(config.supabase.anonKey);
const supabaseServiceKey = sanitizeEnv(config.supabase.serviceRoleKey);

// Prefer service role key on the backend for administrative operations, fallback to anon key
const defaultKey = supabaseServiceKey || supabaseAnonKey;

let supabase = null;
let supabaseAdmin = null;
let supabaseAnon = null;

if (supabaseUrl && defaultKey && defaultKey !== 'your_supabase_anon_key' && defaultKey !== 'your_supabase_service_role_key') {
  try {
    supabase = createClient(supabaseUrl, defaultKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (supabaseServiceKey && supabaseServiceKey !== 'your_supabase_service_role_key') {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    if (supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key') {
      supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  } catch (err) {
    logger.warn('Could not initialize Supabase client:', err.message);
    supabase = null;
    supabaseAdmin = null;
    supabaseAnon = null;
  }
}

// isSupabaseConfigured is ONLY true if a client was successfully constructed
const isSupabaseConfigured = Boolean(supabase !== null);

/**
 * Creates a user-scoped Supabase client using an incoming Bearer JWT
 * Allows executing queries with the logged-in user's RLS context
 */
const createScopedClient = (accessToken) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

/**
 * Standard table names mapping for the Gram Mitra SQL schema
 */
const TABLES = {
  PROFILES: 'profiles',
  HOSPITALS: 'hospitals',
  HOSPITAL_SERVICES: 'hospital_services',
  VILLAGE_PROBLEMS: 'village_problems',
  PROBLEM_UPDATES: 'problem_updates',
  PRODUCTS: 'products',
  NGOS: 'ngos',
  MYTHS: 'myths',
};

/**
 * Tests connection to Supabase database
 * Performs a lightweight query to verify connectivity
 */
const testConnection = async () => {
  if (!isSupabaseConfigured || !supabase) {
    const msg = 'Supabase credentials are not configured or using placeholders in .env';
    logger.warn(`[Supabase] ⚠️  ${msg}`);
    return {
      connected: false,
      configured: false,
      message: msg,
    };
  }

  try {
    // Attempt a lightweight select from the profiles or hospitals table
    const { error } = await supabase.from(TABLES.PROFILES).select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, but connection reached Supabase (Postgres error code 42P01: relation does not exist)
      if (error.code === '42P01') {
        logger.info('[Supabase] ✅ Connected successfully! (Tables not yet created, run src/db/schema.sql in Supabase SQL editor)');
        return {
          connected: true,
          configured: true,
          tablesInitialized: false,
          message: 'Connected to Supabase. Schema tables need to be created.',
        };
      }

      logger.warn(`[Supabase] ⚠️ Connection test query returned: ${error.message} (code: ${error.code || 'UNKNOWN'})`);
      return {
        connected: false,
        configured: true,
        message: error.message,
        error,
      };
    }

    logger.info('[Supabase] ✅ Database connection verified successfully');
    return {
      connected: true,
      configured: true,
      tablesInitialized: true,
      message: 'Supabase database connected and operational.',
    };
  } catch (err) {
    logger.error(`[Supabase] ❌ Database connection error: ${err.message}`);
    return {
      connected: false,
      configured: true,
      message: err.message,
      error: err,
    };
  }
};

module.exports = {
  supabase,
  supabaseAdmin: supabaseAdmin || supabase,
  supabaseAnon: supabaseAnon || supabase,
  createScopedClient,
  testConnection,
  isSupabaseConfigured,
  TABLES,
};
