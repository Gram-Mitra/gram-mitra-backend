const { supabase, supabaseAdmin, TABLES } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Normalizes input keys (handles both camelCase and snake_case)
 */
const normalizeUserData = (data) => {
  return {
    email: data.email ? data.email.trim().toLowerCase() : null,
    password: data.password || null,
    phone: data.phone ? String(data.phone).trim() : null,
    full_name: data.full_name || data.fullName || null,
    age: data.age ? parseInt(data.age, 10) : null,
    state: data.state ? data.state.trim() : null,
    district: data.district ? data.district.trim() : null,
    village: data.village ? data.village.trim() : null,
    profile_image_url: data.profile_image_url || data.profileImageUrl || null,
  };
};

/**
 * Register a new user in Supabase Auth & create their profile record
 */
const registerUser = async (rawPayload) => {
  const payload = normalizeUserData(rawPayload);
  const { email, password, phone, full_name, age, state, district, village, profile_image_url } = payload;

  // Validation
  if (!password || password.length < 6) {
    const error = new Error('Password is required and must be at least 6 characters long');
    error.statusCode = 400;
    throw error;
  }

  // Must have an email (or phone to derive email)
  let userEmail = email;
  if (!userEmail && phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    userEmail = `${cleanPhone}@grammitra.in`;
  }

  if (!userEmail) {
    const error = new Error('Email or phone number is required');
    error.statusCode = 400;
    throw error;
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    const error = new Error('Supabase database client is not configured');
    error.statusCode = 503;
    throw error;
  }

  // Check if phone or email already registered in profiles
  if (phone) {
    const { data: existingPhone } = await client
      .from(TABLES.PROFILES)
      .select('id, phone')
      .eq('phone', phone)
      .maybeSingle();

    if (existingPhone) {
      const error = new Error('A user with this phone number already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  if (email) {
    const { data: existingEmail } = await client
      .from(TABLES.PROFILES)
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      const error = new Error('A user with this email address already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  // Step 1: Create user in Supabase Auth
  let authUser = null;

  if (supabaseAdmin && supabaseAdmin.auth && supabaseAdmin.auth.admin) {
    // Admin API auto-confirms email so user can immediately login
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone,
      },
    });

    if (authError) {
      const error = new Error(authError.message);
      error.statusCode = authError.status || 400;
      throw error;
    }
    authUser = data.user;
  } else {
    // Fallback to standard signUp
    const { data, error: authError } = await supabase.auth.signUp({
      email: userEmail,
      password,
      options: {
        data: {
          full_name,
          phone,
        },
      },
    });

    if (authError) {
      const error = new Error(authError.message);
      error.statusCode = authError.status || 400;
      throw error;
    }
    authUser = data.user;
  }

  if (!authUser || !authUser.id) {
    const error = new Error('Failed to create authentication user in Supabase');
    error.statusCode = 500;
    throw error;
  }

  // Step 2: Insert into profiles table
  const profileRecord = {
    id: authUser.id,
    full_name: full_name || null,
    phone: phone || null,
    email: email || userEmail,
    age: isNaN(age) ? null : age,
    state: state || null,
    district: district || null,
    village: village || null,
    profile_image_url: profile_image_url || null,
  };

  const { data: createdProfile, error: profileError } = await client
    .from(TABLES.PROFILES)
    .upsert(profileRecord)
    .select()
    .single();

  if (profileError) {
    logger.error('Failed to create profile record:', profileError.message);
    // If profile insert fails, attempt cleanup in auth to prevent orphaned auth user
    try {
      if (supabaseAdmin) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      }
    } catch (cleanupErr) {
      logger.error('Cleanup error:', cleanupErr.message);
    }
    const error = new Error(`Failed to create profile: ${profileError.message}`);
    error.statusCode = 500;
    throw error;
  }

  // Step 3: Automatically generate initial session via sign in
  let session = null;
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });
    if (!signInError && signInData) {
      session = signInData.session;
    }
  } catch (err) {
    logger.warn('Could not auto sign-in after registration:', err.message);
  }

  return {
    user: createdProfile || profileRecord,
    session: session
      ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          token_type: session.token_type || 'Bearer',
          expires_at: session.expires_at,
          expires_in: session.expires_in,
        }
      : null,
  };
};

/**
 * Login user using email/phone and password
 */
const loginUser = async (credentials) => {
  const { identifier, email, phone, password } = credentials;

  if (!password) {
    const error = new Error('Password is required');
    error.statusCode = 400;
    throw error;
  }

  const client = supabaseAdmin || supabase;
  if (!supabase) {
    if (process.env.NODE_ENV === 'test') {
      const err = new Error('Invalid login credentials');
      err.statusCode = 401;
      throw err;
    }
    const err = new Error('Supabase client is not configured');
    err.statusCode = 503;
    throw err;
  }

  let targetEmail = email || identifier;

  // If user provided a phone number instead of email, find corresponding email
  const loginWithPhone = phone || (identifier && /^\+?[0-9]{7,15}$/.test(identifier.trim()));
  if (loginWithPhone) {
    const queryPhone = (phone || identifier).trim();
    const { data: profile } = await client
      .from(TABLES.PROFILES)
      .select('email, phone')
      .eq('phone', queryPhone)
      .maybeSingle();

    if (profile && profile.email) {
      targetEmail = profile.email;
    } else {
      // Try derived email format
      const cleanPhone = queryPhone.replace(/\D/g, '');
      targetEmail = `${cleanPhone}@grammitra.in`;
    }
  }

  if (!targetEmail) {
    const error = new Error('Email or phone number is required to log in');
    error.statusCode = 400;
    throw error;
  }

  // Authenticate with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: targetEmail.trim().toLowerCase(),
    password,
  });

  if (error || !data || !data.user) {
    const err = new Error(error ? error.message : 'Invalid login credentials');
    err.statusCode = 401;
    throw err;
  }

  const { user, session } = data;

  // Retrieve user's profile details
  const { data: profile, error: profileErr } = await client
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr) {
    logger.warn(`Could not fetch profile for user ${user.id}:`, profileErr.message);
  }

  const userProfile = profile || {
    id: user.id,
    email: user.email,
    phone: user.user_metadata?.phone || null,
    full_name: user.user_metadata?.full_name || null,
  };

  return {
    user: userProfile,
    session: session
      ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          token_type: session.token_type || 'Bearer',
          expires_at: session.expires_at,
          expires_in: session.expires_in,
        }
      : null,
  };
};

/**
 * Get profile for authenticated user
 */
const getProfileById = async (userId) => {
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    const err = new Error(`Profile not found: ${error.message}`);
    err.statusCode = 404;
    throw err;
  }

  return data;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
  const client = supabaseAdmin || supabase;
  const payload = normalizeUserData(updates);

  // Remove fields that should not be directly overwritten
  delete payload.password;
  if (!payload.email) delete payload.email;

  // Remove undefined / null properties from payload
  Object.keys(payload).forEach((key) => payload[key] === null && delete payload[key]);

  const { data, error } = await client
    .from(TABLES.PROFILES)
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    const err = new Error(`Failed to update profile: ${error.message}`);
    err.statusCode = 400;
    throw err;
  }

  return data;
};

module.exports = {
  registerUser,
  loginUser,
  getProfileById,
  updateProfile,
};
