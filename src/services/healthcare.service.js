const { supabase, supabaseAdmin, TABLES } = require('../config/supabase');
const logger = require('../utils/logger');

// UUID format validator
const isValidUUID = (str) => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// Earth radius in kilometers for distance calculations
const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula to compute distance between two coordinates in kilometers
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = parseFloat(lat1);
  const numLon1 = parseFloat(lon1);
  const numLat2 = parseFloat(lat2);
  const numLon2 = parseFloat(lon2);

  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(numLat2 - numLat1);
  const dLon = toRad(numLon2 - numLon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(numLat1)) * Math.cos(toRad(numLat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10; // 1 decimal precision
};

/**
 * Curated emergency helplines for rural communities
 */
const EMERGENCY_HELPLINES = {
  human: [
    {
      name: 'National Emergency Helpline',
      number: '112',
      description: 'Unified all-in-one emergency response (Police, Fire, Ambulance)',
      tollFree: true,
      category: 'human',
      is24x7: true,
    },
    {
      name: 'Ambulance Emergency Response',
      number: '108',
      description: 'Free emergency medical ambulance service with trained EMTs',
      tollFree: true,
      category: 'human',
      is24x7: true,
    },
    {
      name: 'Janani Shishu Suraksha Vahan',
      number: '102',
      description: 'Free transport for pregnant mothers and sick infants',
      tollFree: true,
      category: 'human',
      is24x7: true,
    },
    {
      name: 'National Health Advice Helpline',
      number: '104',
      description: '24/7 medical advice, directory of blood banks, and grievance support',
      tollFree: true,
      category: 'human',
      is24x7: true,
    },
    {
      name: 'Tele-MANAS Mental Health Support',
      number: '14416',
      description: 'Free 24/7 tele-counseling and psychological support in regional languages',
      tollFree: true,
      category: 'human',
      is24x7: true,
    },
  ],
  animal: [
    {
      name: 'Pashu Sanjeevani (Animal Emergency Helpline)',
      number: '1962',
      description: 'Toll-free mobile veterinary ambulance & emergency clinical assistance',
      tollFree: true,
      category: 'animal',
      is24x7: true,
    },
    {
      name: 'Livestock Health Emergency Helpdesk',
      number: '1800-425-1660',
      description: 'Assistance for livestock epidemic alerts and veterinary guidance',
      tollFree: true,
      category: 'animal',
      is24x7: false,
    },
  ],
};

/**
 * Standard Rural Healthcare & Veterinary Services Catalog
 */
const HEALTHCARE_SERVICES_CATALOG = [
  {
    id: 'ayushman-arogya-mandir',
    name: 'Ayushman Bharat - Arogya Mandir (Health & Wellness Centres)',
    category: 'human',
    type: 'Primary Care & Prevention',
    description: 'Comprehensive Primary Health Care (CPHC) including maternal & child health, non-communicable disease screening, and essential medicines.',
    benefits: [
      'Free consultations & standard diagnostic tests',
      'Free essential drugs distribution',
      'Screening for hypertension, diabetes, and oral/breast/cervical cancers',
      'Wellness and yoga sessions in the village',
    ],
    officialHelpline: '14555',
    eligibility: 'All rural citizens',
    cost: 'Free of Cost',
  },
  {
    id: 'esanjeevani-teleconsultation',
    name: 'e-Sanjeevani Rural Teleconsultation',
    category: 'human',
    type: 'Telemedicine',
    description: 'Enables rural patients at Sub-Centres and PHCs to consult specialist doctors in district and state medical colleges via video link.',
    benefits: [
      'Access to MBBS and MD specialist doctors without travelling to cities',
      'Digital e-prescriptions sent directly via SMS',
      'Follow-up consultations for chronic diseases',
    ],
    officialHelpline: '104',
    eligibility: 'All rural patients visiting local health centres',
    cost: 'Free of Cost',
  },
  {
    id: 'universal-immunization',
    name: 'Universal Immunization Programme (UIP)',
    category: 'human',
    type: 'Vaccination',
    description: 'Free vaccination against 12 life-threatening diseases for pregnant women and children (Polio, BCG, Measles-Rubella, Hepatitis B, Pentavalent, etc.).',
    benefits: [
      'Protection against preventable childhood illnesses',
      'Administered at village Anganwadi and PHC centres every Wednesday/Sub-centre day',
      'Tracked digitally via U-WIN platform',
    ],
    officialHelpline: '1075',
    eligibility: 'Pregnant women and children up to 5 years',
    cost: 'Free of Cost',
  },
  {
    id: 'janani-suraksha-yojana',
    name: 'Janani Suraksha Yojana (JSY & JSSK)',
    category: 'human',
    type: 'Maternal Care',
    description: 'Safe motherhood intervention promoting institutional delivery among poor pregnant women with cash assistance and free transport.',
    benefits: [
      '₹1,400 financial assistance for rural institutional delivery',
      'Free zero-expense delivery including C-section',
      'Free diet, drugs, consumables, and blood transfusion during stay',
      'Free transport from home to hospital and back via 102/108 ambulance',
    ],
    officialHelpline: '102 / 104',
    eligibility: 'All pregnant women delivering in government health facilities',
    cost: 'Free with Cash Incentive',
  },
  {
    id: 'anti-venom-emergency',
    name: 'Emergency Snakebite & Scorpion Sting Anti-Venom',
    category: 'human',
    type: 'Emergency Medicine',
    description: 'Stocked polyvalent anti-snake venom serum (ASVS) and anti-rabies immunoglobulins at Primary and Community Health Centres.',
    benefits: [
      'Immediate administration of life-saving anti-venom',
      'Tetanus toxoid and wound management',
      'Rapid transfer protocol to tertiary ICUs if respiratory failure occurs',
    ],
    officialHelpline: '108',
    eligibility: 'Any bite or sting victim',
    cost: 'Free of Cost in Government Hospitals',
  },
  {
    id: 'pashu-sanjeevani-mobile-van',
    name: '1962 Pashu Sanjeevani Mobile Veterinary Units (MVU)',
    category: 'animal',
    type: 'Emergency Veterinary',
    description: 'Customized mobile veterinary vans equipped with clinical diagnostic equipment, surgical kits, and medicines delivering veterinary aid directly at the farmer doorsteps.',
    benefits: [
      'Veterinary doctors reach village within emergency response window',
      'Doorstep treatment for sick cattle, buffaloes, goats, and poultry',
      'Minor surgical interventions and emergency trauma care',
    ],
    officialHelpline: '1962',
    eligibility: 'All rural dairy farmers and livestock owners',
    cost: 'Free or nominal state fee',
  },
  {
    id: 'livestock-vaccination-mission',
    name: 'National Animal Disease Control Programme (NADCP)',
    category: 'animal',
    type: 'Livestock Vaccination',
    description: '100% centrally sponsored drive to eradicate Foot & Mouth Disease (FMD) and Brucellosis in cattle, buffalo, sheep, and pigs.',
    benefits: [
      'Free bi-annual vaccination at farmer sheds',
      'Unique 12-digit ear tagging (INAPH / Bharat Pashudhan Pashu Aadhaar)',
      'Prevents loss of milk yield and catastrophic livestock mortality',
    ],
    officialHelpline: '1962',
    eligibility: 'All bovine and livestock owners',
    cost: '100% Free of Cost',
  },
  {
    id: 'artificial-insemination-naip',
    name: 'Nationwide Artificial Insemination Programme (NAIP)',
    category: 'animal',
    type: 'Livestock Breeding',
    description: 'Promotion of high genetic merit indigenous and crossbreed semen to enhance milk productivity and genetic value of rural herds.',
    benefits: [
      'Quality frozen semen from certified disease-free bulls',
      'Free or highly subsidized insemination delivered by trained MAITRIs',
      'Pregnancy diagnosis follow-up at 90 days',
    ],
    officialHelpline: '1962',
    eligibility: 'All cattle and buffalo owners in rural areas',
    cost: 'Free or Subsidized',
  },
];

/**
 * Fallback facilities database used when Supabase is offline or for seeded preview
 */
const FALLBACK_FACILITIES = [
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Saphale Primary Health Centre',
    type: 'human',
    address: 'Near Gram Panchayat Office, Station Road',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Saphale',
    latitude: 19.578,
    longitude: 72.825,
    phone: '0250-250456',
    email: 'phc.saphale@maharashtra.gov.in',
    is_emergency: true,
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
    services: [
      {
        id: '210e0cf2-2105-490b-be62-08ba1b75d210',
        hospital_id: '44444444-4444-4444-4444-444444444444',
        service_name: '24/7 Emergency & OPD',
        description: 'General medical consultations, fever, trauma, and first aid',
        available: true,
      },
      {
        id: 'ebc5a6b4-48fa-4094-9a3a-17331a4585f5',
        hospital_id: '44444444-4444-4444-4444-444444444444',
        service_name: 'Anti-Venom Therapy',
        description: 'Emergency stocks of venom neutralization for snake and scorpion bites',
        available: true,
      },
      {
        id: 'fe312b91-88c9-4b45-bd61-12c82ff30190',
        hospital_id: '44444444-4444-4444-4444-444444444444',
        service_name: 'Maternal Delivery & JSY Ward',
        description: 'Safe institutional deliveries with 24-hour observation ward',
        available: true,
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Government Veterinary Dispensary',
    type: 'animal',
    address: 'Main Market Road, Near APMC Market',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Saphale',
    latitude: 19.5765,
    longitude: 72.8222,
    phone: '0250-250123',
    email: 'vet.saphale@maharashtra.gov.in',
    is_emergency: true,
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
    services: [
      {
        id: 'a4db961e-e610-4fd9-a2e2-364c8b753c9a',
        hospital_id: '33333333-3333-3333-3333-333333333333',
        service_name: 'Cattle Vaccination',
        description: 'Foot and Mouth Disease (FMD) and Anthrax vaccination for livestock',
        available: true,
      },
      {
        id: '9c1dcfc3-7dc7-4d6b-a571-f3a25682b57d',
        hospital_id: '33333333-3333-3333-3333-333333333333',
        service_name: 'Emergency Veterinary Surgery',
        description: 'Minor surgical procedures and trauma care for livestock',
        available: true,
      },
      {
        id: 'dc28f378-e516-4297-b236-d1e38467c162',
        hospital_id: '33333333-3333-3333-3333-333333333333',
        service_name: 'Artificial Insemination',
        description: 'Breeding support for dairy cows and buffaloes',
        available: true,
      },
    ],
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Palghar Sub-District Civil Hospital',
    type: 'human',
    address: 'Hospital Road, Near Court Complex',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Palghar',
    latitude: 19.6967,
    longitude: 72.7699,
    phone: '02525-252108',
    email: 'sdh.palghar@maharashtra.gov.in',
    is_emergency: true,
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
    services: [
      {
        id: 'bbbbbbbb-1111-2222-3333-444444444444',
        hospital_id: '55555555-5555-5555-5555-555555555555',
        service_name: '24/7 Casualty & ICU',
        description: 'Advanced emergency casualty, ventilator beds, and trauma stabilization',
        available: true,
      },
      {
        id: 'bbbbbbbb-2222-3333-4444-555555555555',
        hospital_id: '55555555-5555-5555-5555-555555555555',
        service_name: 'Blood Storage Unit',
        description: 'Emergency blood transfusion services for all major blood groups',
        available: true,
      },
    ],
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Palghar District Veterinary Polyclinic & Mobile Unit',
    type: 'animal',
    address: 'Behind Collectorate, Veterinary Complex',
    state: 'Maharashtra',
    district: 'Palghar',
    village: 'Palghar',
    latitude: 19.692,
    longitude: 72.771,
    phone: '02525-254962',
    email: 'vetpoly.palghar@maharashtra.gov.in',
    is_emergency: true,
    is_active: true,
    created_at: '2026-09-29T15:09:22.355Z',
    updated_at: '2026-09-29T15:09:22.355Z',
    services: [
      {
        id: 'cccccccc-1111-2222-3333-444444444444',
        hospital_id: '66666666-6666-6666-6666-666666666666',
        service_name: 'Mobile Veterinary Clinic (1962)',
        description: 'Dispatches emergency veterinary vans directly to farmers villages',
        available: true,
      },
      {
        id: 'cccccccc-2222-3333-4444-555555555555',
        hospital_id: '66666666-6666-6666-6666-666666666666',
        service_name: 'Infectious Disease Lab',
        description: 'Livestock blood, fecal, and milk testing for mastitis and brucellosis',
        available: true,
      },
    ],
  },
];

/**
 * Healthcare & Veterinary Service Layer
 */
class HealthcareService {
  constructor() {
    this.client = supabaseAdmin || supabase;
  }

  /**
   * Get database client safely
   */
  getClient() {
    return supabaseAdmin || supabase;
  }

  /**
   * Query facilities (hospitals & veterinary clinics) with filtering, search, and distance computation
   */
  async getFacilities(options = {}) {
    const {
      type,
      state,
      district,
      village,
      is_emergency,
      is_active = true,
      search,
      service,
      lat,
      lng,
      radiusKm,
      limit = 20,
      offset = 0,
    } = options;

    const client = this.getClient();

    if (client) {
      try {
        let query = client
          .from(TABLES.HOSPITALS)
          .select('*, services:hospital_services(*)');

        if (is_active !== null && is_active !== undefined) {
          query = query.eq('is_active', is_active === true || is_active === 'true');
        }

        if (type && type !== 'all') {
          query = query.eq('type', type);
        }

        if (state) {
          query = query.ilike('state', `%${state.trim()}%`);
        }

        if (district) {
          query = query.ilike('district', `%${district.trim()}%`);
        }

        if (village) {
          query = query.ilike('village', `%${village.trim()}%`);
        }

        if (is_emergency !== undefined) {
          const isEmerg = is_emergency === true || is_emergency === 'true';
          query = query.eq('is_emergency', isEmerg);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          let facilities = data;

          // Search term filter (in name, address, village, district, or service_name)
          if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            facilities = facilities.filter((f) => {
              const matchesName = f.name && f.name.toLowerCase().includes(s);
              const matchesAddress = f.address && f.address.toLowerCase().includes(s);
              const matchesVillage = f.village && f.village.toLowerCase().includes(s);
              const matchesDistrict = f.district && f.district.toLowerCase().includes(s);
              const matchesService = Array.isArray(f.services) && f.services.some(
                (srv) => srv.service_name && srv.service_name.toLowerCase().includes(s)
              );
              return matchesName || matchesAddress || matchesVillage || matchesDistrict || matchesService;
            });
          }

          // Service specific filter
          if (service && service.trim()) {
            const srvTerm = service.trim().toLowerCase();
            facilities = facilities.filter((f) => {
              return Array.isArray(f.services) && f.services.some(
                (srv) => (srv.service_name && srv.service_name.toLowerCase().includes(srvTerm)) ||
                         (srv.description && srv.description.toLowerCase().includes(srvTerm))
              );
            });
          }

          // Calculate distance if lat and lng provided
          if (lat != null && lng != null) {
            facilities = facilities.map((f) => {
              const distance_km = calculateDistanceKm(lat, lng, f.latitude, f.longitude);
              return { ...f, distance_km };
            });

            // Sort by distance (facilities with distance come first)
            facilities.sort((a, b) => {
              if (a.distance_km == null) return 1;
              if (b.distance_km == null) return -1;
              return a.distance_km - b.distance_km;
            });

            // Filter by radius if provided
            if (radiusKm && !isNaN(Number(radiusKm))) {
              const maxRadius = parseFloat(radiusKm);
              facilities = facilities.filter(
                (f) => f.distance_km != null && f.distance_km <= maxRadius
              );
            }
          }

          const total = facilities.length;
          const paginated = facilities.slice(Number(offset), Number(offset) + Number(limit));

          return {
            total,
            limit: Number(limit),
            offset: Number(offset),
            facilities: paginated,
          };
        }
      } catch (err) {
        logger.warn('Failed querying Supabase hospitals, falling back to local dataset:', err.message);
      }
    }

    // Fallback to local dataset
    let fallback = JSON.parse(JSON.stringify(FALLBACK_FACILITIES));

    if (type && type !== 'all') {
      fallback = fallback.filter((f) => f.type === type);
    }
    if (district) {
      fallback = fallback.filter((f) => f.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (village) {
      fallback = fallback.filter((f) => f.village.toLowerCase().includes(village.toLowerCase()));
    }
    if (is_emergency !== undefined) {
      const isEmerg = is_emergency === true || is_emergency === 'true';
      fallback = fallback.filter((f) => f.is_emergency === isEmerg);
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      fallback = fallback.filter(
        (f) => f.name.toLowerCase().includes(s) ||
               (f.address && f.address.toLowerCase().includes(s)) ||
               (f.village && f.village.toLowerCase().includes(s)) ||
               f.services.some((srv) => srv.service_name.toLowerCase().includes(s))
      );
    }
    if (service && service.trim()) {
      const srvTerm = service.trim().toLowerCase();
      fallback = fallback.filter(
        (f) => f.services.some(
          (srv) => srv.service_name.toLowerCase().includes(srvTerm) ||
                   (srv.description && srv.description.toLowerCase().includes(srvTerm))
        )
      );
    }
    if (lat != null && lng != null) {
      fallback = fallback.map((f) => ({
        ...f,
        distance_km: calculateDistanceKm(lat, lng, f.latitude, f.longitude),
      }));
      fallback.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
      if (radiusKm && !isNaN(Number(radiusKm))) {
        const maxRadius = parseFloat(radiusKm);
        fallback = fallback.filter((f) => f.distance_km != null && f.distance_km <= maxRadius);
      }
    }

    const total = fallback.length;
    const paginated = fallback.slice(Number(offset), Number(offset) + Number(limit));

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      facilities: paginated,
    };
  }

  /**
   * Get single facility by ID
   */
  async getFacilityById(id, expectedType = null) {
    if (!id) {
      const error = new Error('Facility ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        let query = client
          .from(TABLES.HOSPITALS)
          .select('*, services:hospital_services(*)')
          .eq('id', id);

        if (expectedType && expectedType !== 'all') {
          query = query.eq('type', expectedType);
        }

        const { data, error } = await query.maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        logger.warn(`Error getting facility ${id} from Supabase:`, err.message);
      }
    }

    // Check fallback
    const facility = FALLBACK_FACILITIES.find(
      (f) => f.id === id && (!expectedType || expectedType === 'all' || f.type === expectedType)
    );

    if (!facility) {
      const error = new Error(`Healthcare facility with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return facility;
  }

  /**
   * Create a new hospital or veterinary clinic
   */
  async createFacility(data) {
    const {
      name,
      type,
      address,
      state,
      district,
      village,
      latitude,
      longitude,
      phone,
      email,
      is_emergency = false,
      is_active = true,
      services = [],
    } = data;

    if (!name || !name.trim()) {
      const error = new Error('Facility name is required');
      error.statusCode = 400;
      throw error;
    }

    if (!type || !['human', 'animal'].includes(type.trim().toLowerCase())) {
      const error = new Error("Facility type must be either 'human' or 'animal'");
      error.statusCode = 400;
      throw error;
    }

    const facilityPayload = {
      name: name.trim(),
      type: type.trim().toLowerCase(),
      address: address ? address.trim() : null,
      state: state ? state.trim() : null,
      district: district ? district.trim() : null,
      village: village ? village.trim() : null,
      latitude: latitude != null && !isNaN(Number(latitude)) ? parseFloat(latitude) : null,
      longitude: longitude != null && !isNaN(Number(longitude)) ? parseFloat(longitude) : null,
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim().toLowerCase() : null,
      is_emergency: Boolean(is_emergency),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    };

    const client = this.getClient();

    if (!client) {
      // In-memory mock creation
      const mockId = require('crypto').randomUUID();
      let createdServices = [];
      if (Array.isArray(services) && services.length > 0) {
        createdServices = services.map((srv) => {
          const srvId = require('crypto').randomUUID();
          if (typeof srv === 'string') {
            return {
              id: srvId,
              hospital_id: mockId,
              service_name: srv.trim(),
              description: null,
              available: true,
            };
          }
          return {
            id: srv.id || srvId,
            hospital_id: mockId,
            service_name: srv.service_name || srv.name || 'General Service',
            description: srv.description || null,
            available: srv.available !== undefined ? Boolean(srv.available) : true,
          };
        });
      }
      const newFacility = {
        id: mockId,
        ...facilityPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        services: createdServices,
      };
      FALLBACK_FACILITIES.push(newFacility);
      return newFacility;
    }

    const { data: created, error } = await client
      .from(TABLES.HOSPITALS)
      .insert(facilityPayload)
      .select()
      .single();

    if (error) {
      logger.error('Error inserting hospital:', error.message);
      const err = new Error(`Failed to create healthcare facility: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }

    // If services were provided, insert them into hospital_services
    let createdServices = [];
    if (Array.isArray(services) && services.length > 0) {
      const serviceRecords = services.map((srv) => {
        if (typeof srv === 'string') {
          return {
            hospital_id: created.id,
            service_name: srv.trim(),
            description: null,
            available: true,
          };
        }
        return {
          hospital_id: created.id,
          service_name: srv.service_name || srv.name || 'General Service',
          description: srv.description || null,
          available: srv.available !== undefined ? Boolean(srv.available) : true,
        };
      });

      const { data: insertedServices, error: srvError } = await client
        .from(TABLES.HOSPITAL_SERVICES)
        .insert(serviceRecords)
        .select();

      if (!srvError && insertedServices) {
        createdServices = insertedServices;
      }
    }

    return {
      ...created,
      services: createdServices,
    };
  }

  /**
   * Update an existing hospital or veterinary clinic
   */
  async updateFacility(id, data, expectedType = null) {
    if (!id) {
      const error = new Error('Facility ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();
    if (!client) {
      const facility = FALLBACK_FACILITIES.find(
        (f) => f.id === id && (!expectedType || expectedType === 'all' || f.type === expectedType)
      );
      if (!facility) {
        const error = new Error(`Facility with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }
      Object.assign(facility, data, { updated_at: new Date().toISOString() });
      return facility;
    }

    // Verify existing record
    let checkQuery = client.from(TABLES.HOSPITALS).select('*').eq('id', id);
    if (expectedType && expectedType !== 'all') {
      checkQuery = checkQuery.eq('type', expectedType);
    }
    const { data: existing, error: findError } = await checkQuery.maybeSingle();

    if (findError || !existing) {
      const error = new Error(`Facility with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const updatePayload = {};
    if (data.name !== undefined) updatePayload.name = String(data.name).trim();
    if (data.type !== undefined) {
      const t = String(data.type).trim().toLowerCase();
      if (!['human', 'animal'].includes(t)) {
        const error = new Error("Facility type must be 'human' or 'animal'");
        error.statusCode = 400;
        throw error;
      }
      updatePayload.type = t;
    }
    if (data.address !== undefined) updatePayload.address = data.address ? String(data.address).trim() : null;
    if (data.state !== undefined) updatePayload.state = data.state ? String(data.state).trim() : null;
    if (data.district !== undefined) updatePayload.district = data.district ? String(data.district).trim() : null;
    if (data.village !== undefined) updatePayload.village = data.village ? String(data.village).trim() : null;
    if (data.latitude !== undefined) updatePayload.latitude = data.latitude != null ? parseFloat(data.latitude) : null;
    if (data.longitude !== undefined) updatePayload.longitude = data.longitude != null ? parseFloat(data.longitude) : null;
    if (data.phone !== undefined) updatePayload.phone = data.phone ? String(data.phone).trim() : null;
    if (data.email !== undefined) updatePayload.email = data.email ? String(data.email).trim().toLowerCase() : null;
    if (data.is_emergency !== undefined) updatePayload.is_emergency = Boolean(data.is_emergency);
    if (data.is_active !== undefined) updatePayload.is_active = Boolean(data.is_active);

    const { data: updated, error: updateError } = await client
      .from(TABLES.HOSPITALS)
      .update(updatePayload)
      .eq('id', id)
      .select('*, services:hospital_services(*)')
      .single();

    if (updateError) {
      const error = new Error(`Failed to update facility: ${updateError.message}`);
      error.statusCode = 500;
      throw error;
    }

    return updated;
  }

  /**
   * Delete a facility (soft or hard delete)
   */
  async deleteFacility(id, hardDelete = false, expectedType = null) {
    if (!id) {
      const error = new Error('Facility ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();
    if (!client) {
      const idx = FALLBACK_FACILITIES.findIndex(
        (f) => f.id === id && (!expectedType || expectedType === 'all' || f.type === expectedType)
      );
      if (idx === -1) {
        const error = new Error(`Facility with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }
      const [deleted] = FALLBACK_FACILITIES.splice(idx, 1);
      return { id: deleted.id, deleted: true };
    }

    // Verify existing
    let checkQuery = client.from(TABLES.HOSPITALS).select('id, name, type').eq('id', id);
    if (expectedType && expectedType !== 'all') {
      checkQuery = checkQuery.eq('type', expectedType);
    }
    const { data: existing, error: checkError } = await checkQuery.maybeSingle();

    if (checkError || !existing) {
      const error = new Error(`Facility with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    if (hardDelete) {
      const { error: delError } = await client.from(TABLES.HOSPITALS).delete().eq('id', id);
      if (delError) {
        const error = new Error(`Failed to delete facility: ${delError.message}`);
        error.statusCode = 500;
        throw error;
      }
      return { id, deleted: true, mode: 'hard' };
    } else {
      const { error: softDelError } = await client
        .from(TABLES.HOSPITALS)
        .update({ is_active: false })
        .eq('id', id);

      if (softDelError) {
        const error = new Error(`Failed to deactivate facility: ${softDelError.message}`);
        error.statusCode = 500;
        throw error;
      }
      return { id, deactivated: true, mode: 'soft' };
    }
  }

  /**
   * Geolocation search: get nearby facilities
   */
  async getNearbyFacilities({ lat, lng, radiusKm = 25, type = 'all', limit = 20 }) {
    if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) {
      const error = new Error("Valid 'lat' and 'lng' query coordinates are required for nearby search");
      error.statusCode = 400;
      throw error;
    }

    return this.getFacilities({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radiusKm: parseFloat(radiusKm),
      type,
      limit: parseInt(limit, 10) || 20,
    });
  }

  /**
   * Emergency facilities and helpline numbers
   */
  async getEmergencyData({ district, state, lat, lng, type = 'all' } = {}) {
    const facilitiesResult = await this.getFacilities({
      is_emergency: true,
      type,
      district,
      state,
      lat,
      lng,
      limit: 50,
    });

    let helplines = [];
    if (type === 'human') {
      helplines = EMERGENCY_HELPLINES.human;
    } else if (type === 'animal') {
      helplines = EMERGENCY_HELPLINES.animal;
    } else {
      helplines = [...EMERGENCY_HELPLINES.human, ...EMERGENCY_HELPLINES.animal];
    }

    return {
      emergency_helplines: helplines,
      emergency_facilities: facilitiesResult.facilities,
      total_facilities: facilitiesResult.total,
    };
  }

  // ============================================================================
  // HEALTHCARE SERVICES METHODS
  // ============================================================================

  /**
   * Get all healthcare and veterinary services (optionally filtered by hospital, facility type, search)
   */
  async getServices(options = {}) {
    const {
      hospital_id,
      facility_type,
      search,
      available,
      district,
      state,
      limit = 50,
      offset = 0,
    } = options;

    const client = this.getClient();

    if (client) {
      try {
        let query = client
          .from(TABLES.HOSPITAL_SERVICES)
          .select('*, hospital:hospitals(id, name, type, phone, address, village, district, state, latitude, longitude, is_emergency, is_active)');

        if (hospital_id) {
          query = query.eq('hospital_id', hospital_id);
        }

        if (available !== undefined) {
          const isAvail = available === true || available === 'true';
          query = query.eq('available', isAvail);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          let services = data;

          // Filter by facility_type (e.g., 'human' or 'animal')
          if (facility_type && facility_type !== 'all') {
            services = services.filter((s) => s.hospital && s.hospital.type === facility_type);
          }

          // Filter active facilities only
          services = services.filter((s) => !s.hospital || s.hospital.is_active !== false);

          // Filter by district/state if specified
          if (district) {
            services = services.filter(
              (s) => s.hospital && s.hospital.district && s.hospital.district.toLowerCase().includes(district.toLowerCase())
            );
          }
          if (state) {
            services = services.filter(
              (s) => s.hospital && s.hospital.state && s.hospital.state.toLowerCase().includes(state.toLowerCase())
            );
          }

          // Search term filter
          if (search && search.trim()) {
            const term = search.trim().toLowerCase();
            services = services.filter((s) => {
              const nameMatches = s.service_name && s.service_name.toLowerCase().includes(term);
              const descMatches = s.description && s.description.toLowerCase().includes(term);
              const hospMatches = s.hospital && s.hospital.name && s.hospital.name.toLowerCase().includes(term);
              return nameMatches || descMatches || hospMatches;
            });
          }

          const total = services.length;
          const paginated = services.slice(Number(offset), Number(offset) + Number(limit));

          return {
            total,
            limit: Number(limit),
            offset: Number(offset),
            services: paginated,
          };
        }
      } catch (err) {
        logger.warn('Error fetching hospital services from Supabase, using fallback:', err.message);
      }
    }

    // Fallback extraction
    let allFallbackServices = [];
    FALLBACK_FACILITIES.forEach((fac) => {
      fac.services.forEach((srv) => {
        allFallbackServices.push({
          ...srv,
          hospital: {
            id: fac.id,
            name: fac.name,
            type: fac.type,
            phone: fac.phone,
            address: fac.address,
            village: fac.village,
            district: fac.district,
            state: fac.state,
            latitude: fac.latitude,
            longitude: fac.longitude,
            is_emergency: fac.is_emergency,
            is_active: fac.is_active,
          },
        });
      });
    });

    if (hospital_id) {
      allFallbackServices = allFallbackServices.filter((s) => s.hospital_id === hospital_id);
    }
    if (facility_type && facility_type !== 'all') {
      allFallbackServices = allFallbackServices.filter((s) => s.hospital.type === facility_type);
    }
    if (available !== undefined) {
      const isAvail = available === true || available === 'true';
      allFallbackServices = allFallbackServices.filter((s) => s.available === isAvail);
    }
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      allFallbackServices = allFallbackServices.filter(
        (s) => s.service_name.toLowerCase().includes(term) ||
               (s.description && s.description.toLowerCase().includes(term))
      );
    }

    const total = allFallbackServices.length;
    const paginated = allFallbackServices.slice(Number(offset), Number(offset) + Number(limit));

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      services: paginated,
    };
  }

  /**
   * Get single service by ID
   */
  async getServiceById(id) {
    if (!id) {
      const error = new Error('Service ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        const { data, error } = await client
          .from(TABLES.HOSPITAL_SERVICES)
          .select('*, hospital:hospitals(*)')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        logger.warn(`Error getting service ${id}:`, err.message);
      }
    }

    // Search fallback
    for (const fac of FALLBACK_FACILITIES) {
      const found = fac.services.find((s) => s.id === id);
      if (found) {
        return {
          ...found,
          hospital: fac,
        };
      }
    }

    const error = new Error(`Healthcare service with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  /**
   * Add a new service to a hospital or veterinary facility
   */
  async createService(data) {
    const { hospital_id, service_name, description, available = true } = data;

    if (!hospital_id) {
      const error = new Error('Hospital ID (hospital_id) is required');
      error.statusCode = 400;
      throw error;
    }

    if (!service_name || !service_name.trim()) {
      const error = new Error('Service name (service_name) is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();
    if (!client) {
      const hospital = FALLBACK_FACILITIES.find((f) => f.id === hospital_id);
      if (!hospital) {
        const error = new Error(`Associated facility with ID '${hospital_id}' does not exist`);
        error.statusCode = 404;
        throw error;
      }
      const newService = {
        id: require('crypto').randomUUID(),
        hospital_id,
        service_name: service_name.trim(),
        description: description ? description.trim() : null,
        available: available !== undefined ? Boolean(available) : true,
        created_at: new Date().toISOString(),
        hospital: {
          id: hospital.id,
          name: hospital.name,
          type: hospital.type,
        },
      };
      if (!hospital.services) hospital.services = [];
      hospital.services.push(newService);
      return newService;
    }

    // Verify hospital exists
    const { data: hospital, error: hospError } = await client
      .from(TABLES.HOSPITALS)
      .select('id, name, type')
      .eq('id', hospital_id)
      .maybeSingle();

    if (hospError || !hospital) {
      const error = new Error(`Associated facility with ID '${hospital_id}' does not exist`);
      error.statusCode = 404;
      throw error;
    }

    const servicePayload = {
      hospital_id,
      service_name: service_name.trim(),
      description: description ? description.trim() : null,
      available: available !== undefined ? Boolean(available) : true,
    };

    const { data: created, error: insertError } = await client
      .from(TABLES.HOSPITAL_SERVICES)
      .insert(servicePayload)
      .select('*, hospital:hospitals(*)')
      .single();

    if (insertError) {
      const error = new Error(`Failed to create service: ${insertError.message}`);
      error.statusCode = 500;
      throw error;
    }

    return created;
  }

  /**
   * Update an existing service
   */
  async updateService(id, data) {
    if (!id) {
      const error = new Error('Service ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();
    if (!client) {
      for (const fac of FALLBACK_FACILITIES) {
        const srv = (fac.services || []).find((s) => s.id === id);
        if (srv) {
          if (data.service_name !== undefined) {
            if (!data.service_name.trim()) {
              const error = new Error('Service name cannot be empty');
              error.statusCode = 400;
              throw error;
            }
            srv.service_name = data.service_name.trim();
          }
          if (data.description !== undefined) {
            srv.description = data.description ? data.description.trim() : null;
          }
          if (data.available !== undefined) {
            srv.available = Boolean(data.available);
          }
          srv.hospital = fac;
          return srv;
        }
      }
      const error = new Error(`Service with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Verify service exists
    const { data: existing, error: checkError } = await client
      .from(TABLES.HOSPITAL_SERVICES)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError || !existing) {
      const error = new Error(`Service with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const updatePayload = {};
    if (data.service_name !== undefined) {
      if (!data.service_name.trim()) {
        const error = new Error('Service name cannot be empty');
        error.statusCode = 400;
        throw error;
      }
      updatePayload.service_name = data.service_name.trim();
    }
    if (data.description !== undefined) {
      updatePayload.description = data.description ? data.description.trim() : null;
    }
    if (data.available !== undefined) {
      updatePayload.available = Boolean(data.available);
    }

    const { data: updated, error: updateError } = await client
      .from(TABLES.HOSPITAL_SERVICES)
      .update(updatePayload)
      .eq('id', id)
      .select('*, hospital:hospitals(*)')
      .single();

    if (updateError) {
      const error = new Error(`Failed to update service: ${updateError.message}`);
      error.statusCode = 500;
      throw error;
    }

    return updated;
  }

  /**
   * Delete a service
   */
  async deleteService(id) {
    if (!id) {
      const error = new Error('Service ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();
    if (!client) {
      for (const fac of FALLBACK_FACILITIES) {
        const idx = (fac.services || []).findIndex((s) => s.id === id);
        if (idx !== -1) {
          fac.services.splice(idx, 1);
          return { id, deleted: true };
        }
      }
      const error = new Error(`Service with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const { data: existing, error: checkError } = await client
      .from(TABLES.HOSPITAL_SERVICES)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (checkError || !existing) {
      const error = new Error(`Service with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const { error: delError } = await client
      .from(TABLES.HOSPITAL_SERVICES)
      .delete()
      .eq('id', id);

    if (delError) {
      const error = new Error(`Failed to delete service: ${delError.message}`);
      error.statusCode = 500;
      throw error;
    }

    return { id, deleted: true };
  }

  /**
   * Return the curated government healthcare & veterinary programs catalog
   */
  getServicesCatalog(category = null) {
    if (category && category !== 'all') {
      return HEALTHCARE_SERVICES_CATALOG.filter((item) => item.category === category);
    }
    return HEALTHCARE_SERVICES_CATALOG;
  }

  /**
   * Return emergency helpline directory
   */
  getEmergencyHelplines(category = null) {
    if (category === 'human') return EMERGENCY_HELPLINES.human;
    if (category === 'animal') return EMERGENCY_HELPLINES.animal;
    return EMERGENCY_HELPLINES;
  }
}

module.exports = new HealthcareService();
