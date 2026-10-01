/**
 * Supabase Models & Table References
 * Provides direct table query builders and references for all 8 core entities
 */
const { supabase, supabaseAdmin, TABLES } = require('../config/supabase');

const createModelHelper = (tableName) => ({
  tableName,
  /**
   * Returns a query builder for this table
   * @param {object} [client] - Optional custom or scoped Supabase client
   */
  query: (client = supabase) => client ? client.from(tableName) : null,
  select: (columns = '*', client = supabase) => client.from(tableName).select(columns),
  insert: (values, client = supabase) => client.from(tableName).insert(values),
  update: (values, client = supabase) => client.from(tableName).update(values),
  delete: (client = supabase) => client.from(tableName).delete(),
});

module.exports = {
  TABLES,
  supabase,
  supabaseAdmin,

  // Core Tables
  Profile: createModelHelper(TABLES.PROFILES),
  Hospital: createModelHelper(TABLES.HOSPITALS),
  HospitalService: createModelHelper(TABLES.HOSPITAL_SERVICES),
  VillageProblem: createModelHelper(TABLES.VILLAGE_PROBLEMS),
  ProblemUpdate: createModelHelper(TABLES.PROBLEM_UPDATES),
  Product: createModelHelper(TABLES.PRODUCTS),
  Order: createModelHelper(TABLES.ORDERS),
  Ngo: createModelHelper(TABLES.NGOS),
  Myth: createModelHelper(TABLES.MYTHS),

  // Backwards compatibility aliases
  User: createModelHelper(TABLES.PROFILES),
  HealthcareFacility: createModelHelper(TABLES.HOSPITALS),
  Superstition: createModelHelper(TABLES.MYTHS),
  Scheme: {},
};
