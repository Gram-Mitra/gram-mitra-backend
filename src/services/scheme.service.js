const config = require('../config');
const logger = require('../utils/logger');

// In-memory cache for API responses
const memoryCache = new Map();

/**
 * Curated Rural Government Schemes Catalog
 */
const RURAL_SCHEMES_CATALOG = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    code: 'PM-KISAN',
    ministry: 'Ministry of Agriculture and Farmers Welfare',
    department: 'Department of Agriculture and Farmers Welfare',
    sector: 'Agriculture',
    summary: 'Direct income support of ₹6,000 per year in three equal 4-monthly installments to all eligible landholding farmer families.',
    benefits: '₹6,000 per year directly transferred to bank accounts (DBT) in 3 equal installments of ₹2,000.',
    eligibility: [
      'All landholding farmer families with cultivable land in their names.',
      'Aadhaar-seeded bank account is mandatory.',
      'Subject to standard exclusion criteria (e.g. institutional landholders, high-income taxpayers).',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Proof of landholding (Khatauni / Khasra records)',
      'Active bank account passbook details',
      'Mobile number linked with Aadhaar',
    ],
    applicationProcess: 'Self-registration on PM-KISAN portal (pmkisan.gov.in) or via local CSC (Common Service Centre) / Gram Panchayat nodal officer.',
    officialPortal: 'https://pmkisan.gov.in',
    hasLiveData: true,
    dataGovResourceId: config.dataGov.resourceId,
  },
  {
    id: 'pm-awas-yojana-gramin',
    name: 'Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)',
    code: 'PMAY-G',
    ministry: 'Ministry of Rural Development',
    department: 'Department of Rural Development',
    sector: 'Rural Housing',
    summary: 'Financial assistance to rural homeless and households living in kutcha and dilapidated houses to build pucca houses with basic amenities.',
    benefits: '₹1.20 Lakh in plain areas and ₹1.30 Lakh in hilly/difficult/IAP areas, plus 90-95 person-days of unskilled labor under MGNREGA and ₹12,000 for toilet construction via SBM.',
    eligibility: [
      'Homeless rural households or families living in zero, one, or two-room kutcha houses.',
      'Identified through Socio-Economic and Caste Census (SECC) / Awaas+ list verified by Gram Sabha.',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Bank Account linked with Aadhaar',
      'Job Card (MGNREGA)',
      'Certificate of land / site possession',
    ],
    applicationProcess: 'Beneficiary lists are shortlisted via Gram Sabha verification from SECC / Awaas+ database. Contact Block Development Office (BDO) or Gram Panchayat Secretary.',
    officialPortal: 'https://pmayg.nic.in',
    hasLiveData: false,
  },
  {
    id: 'mgnrega',
    name: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
    code: 'MGNREGA',
    ministry: 'Ministry of Rural Development',
    department: 'Department of Rural Development',
    sector: 'Livelihood & Employment',
    summary: 'Guarantees at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.',
    benefits: 'Guaranteed 100 days of wage employment within 5 km of village, or unemployment allowance if work is not provided within 15 days.',
    eligibility: [
      'Adult members of any rural household willing to do unskilled manual labor.',
      'Resident of the local Gram Panchayat area.',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Photograph of household members',
      'Bank / Post Office account passbook',
      'Gram Panchayat residence verification',
    ],
    applicationProcess: 'Apply for a Job Card at the local Gram Panchayat office in writing or verbally. Work application can be submitted once Job Card is issued.',
    officialPortal: 'https://nrega.nic.in',
    hasLiveData: false,
  },
  {
    id: 'pm-fasal-bima',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    code: 'PMFBY',
    ministry: 'Ministry of Agriculture and Farmers Welfare',
    department: 'Department of Agriculture and Farmers Welfare',
    sector: 'Agriculture Insurance',
    summary: 'Comprehensive crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest stages.',
    benefits: 'Very low premium: 2% for Kharif food/oilseed crops, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops. Remaining premium subsidized by Government.',
    eligibility: [
      'All farmers growing notified crops in notified areas (both loanee and non-loanee farmers, sharecroppers, and tenant farmers).',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land Ownership document / Tenant agreement (RoR/Khatauni)',
      'Sowing certificate / declaration issued by Patwari / Village Officer',
      'Bank passbook details',
    ],
    applicationProcess: 'Apply online on pmfby.gov.in, nearest bank branch, or CSC within the notified cut-off dates for the season.',
    officialPortal: 'https://pmfby.gov.in',
    hasLiveData: false,
  },
  {
    id: 'ayushman-bharat-pmjay',
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    code: 'AB-PMJAY',
    ministry: 'Ministry of Health and Family Welfare',
    department: 'National Health Authority (NHA)',
    sector: 'Healthcare',
    summary: 'Health coverage of up to ₹5,00,000 per eligible family per year for secondary and tertiary care hospitalization.',
    benefits: 'Cashless and paperless treatment at all empaneled public and private hospitals across India.',
    eligibility: [
      'Deprived rural families based on SECC 2011 criteria (D1 to D7 categories) and RSBY beneficiaries.',
      'Recently expanded to all senior citizens aged 70+ regardless of income.',
    ],
    documentsRequired: [
      'Aadhaar Card or Ration Card for identity verification',
      'Mobile number linked to Aadhaar',
    ],
    applicationProcess: 'Check eligibility on beneficiary.nha.gov.in or visit the nearest Ayushman Arogya Mandir, CSC, or empaneled hospital with an Ayushman Mitra desk.',
    officialPortal: 'https://pmjay.gov.in',
    hasLiveData: false,
  },
  {
    id: 'pm-krishi-sinchayee',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
    code: 'PMKSY',
    ministry: 'Ministry of Jal Shakti & Ministry of Agriculture',
    department: 'Department of Water Resources & DAC&FW',
    sector: 'Irrigation & Agriculture',
    summary: 'Ensures water access to every farm ("Har Khet Ko Pani") and enhances water use efficiency ("More Crop Per Drop") via micro-irrigation.',
    benefits: 'Up to 45% - 55% subsidy on installation of drip and sprinkler irrigation systems.',
    eligibility: [
      'All farmers cultivating agricultural land with an assured water source.',
      'Members of Water User Associations (WUAs) and cooperative farming societies.',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land records (7/12 extract, Khatauni)',
      'Bank passbook',
      'Quotation/Invoice from authorized micro-irrigation supplier',
    ],
    applicationProcess: 'Apply through state agriculture/horticulture department portal or visit the District Agriculture Officer / Krishi Vigyan Kendra (KVK).',
    officialPortal: 'https://pmksy.gov.in',
    hasLiveData: false,
  },
];

/**
 * Verified NGOs and civil society organizations assisting villagers
 */
const RURAL_NGOS = [
  {
    id: 'ngo-pradan',
    name: 'PRADAN (Professional Assistance for Development Action)',
    focusArea: 'Rural Livelihoods & Farmer Producer Groups',
    statesActive: ['Madhya Pradesh', 'Jharkhand', 'Odisha', 'West Bengal', 'Bihar'],
    website: 'https://www.pradan.net',
    contact: '+91-11-40407700',
    helpProvided: 'Assistance with scheme registration, SHG formation, farm collectives, and irrigation support.',
  },
  {
    id: 'ngo-sewa',
    name: 'SEWA Bharat',
    focusArea: 'Women empowerment, financial inclusion & social security schemes',
    statesActive: ['Gujarat', 'Rajasthan', 'Uttarakhand', 'Bihar', 'Delhi'],
    website: 'https://sewabharat.org',
    contact: '+91-11-25841369',
    helpProvided: 'Direct help with bank account opening, Aadhaar seeding, DBT verification, and Ayushman Bharat enrollment.',
  },
  {
    id: 'ngo-agrima',
    name: 'Gramin Vikas Sahayata Sanstha',
    focusArea: 'Gram Panchayat citizen service facilitation & digital literacy',
    statesActive: ['Maharashtra', 'Madhya Pradesh', 'Chhattisgarh', 'Uttar Pradesh'],
    website: 'https://gramin-mitra-ngo.org',
    contact: '1800-180-1551 (Kisan Call Center Helpline)',
    helpProvided: 'Free verification of land records, Khasra extraction, and PM-KISAN e-KYC support.',
  },
];

/**
 * Fallback records if data.gov.in is temporarily unreachable
 */
const FALLBACK_PM_KISAN_RECORDS = [
  {
    StateCode: 23,
    DistrictCode: 392,
    SubDistrictCode: 7033,
    BlockCode: 3746,
    VillageCode: 498098,
    StateName: 'MADHYA PRADESH',
    DistrictName: 'BALAGHAT',
    SubDistrictName: 'Birsa',
    BlockName: 'BIRSA',
    VillageName: 'Kachnari',
    MaleCount: 364,
    FemaleCount: 164,
    TransGenderCount: 0,
    FinYearID: 8,
    QuadrimesterNo: 3,
    InstallmentReleaseNo: 22,
    QuadFromDate: '2025-12-01T00:00:00',
    QuadEndDate: '2026-03-31T00:00:00',
  },
  {
    StateCode: 23,
    DistrictCode: 392,
    SubDistrictCode: 7033,
    BlockCode: 3746,
    VillageCode: 498099,
    StateName: 'MADHYA PRADESH',
    DistrictName: 'BALAGHAT',
    SubDistrictName: 'Birsa',
    BlockName: 'BIRSA',
    VillageName: 'Bodaljhola',
    MaleCount: 289,
    FemaleCount: 142,
    TransGenderCount: 0,
    FinYearID: 8,
    QuadrimesterNo: 3,
    InstallmentReleaseNo: 22,
    QuadFromDate: '2025-12-01T00:00:00',
    QuadEndDate: '2026-03-31T00:00:00',
  },
  {
    StateCode: 23,
    DistrictCode: 392,
    SubDistrictCode: 7033,
    BlockCode: 3746,
    VillageCode: 498100,
    StateName: 'MADHYA PRADESH',
    DistrictName: 'BALAGHAT',
    SubDistrictName: 'Birsa',
    BlockName: 'BIRSA',
    VillageName: 'Salheghat',
    MaleCount: 195,
    FemaleCount: 98,
    TransGenderCount: 0,
    FinYearID: 8,
    QuadrimesterNo: 3,
    InstallmentReleaseNo: 22,
    QuadFromDate: '2025-12-01T00:00:00',
    QuadEndDate: '2026-03-31T00:00:00',
  },
];

/**
 * Normalizes a raw data.gov.in beneficiary record
 */
const normalizeBeneficiaryRecord = (rec) => {
  const male = Number(rec.MaleCount || 0);
  const female = Number(rec.FemaleCount || 0);
  const trans = Number(rec.TransGenderCount || 0);
  const total = male + female + trans;

  return {
    id: `${rec.StateCode || ''}-${rec.DistrictCode || ''}-${rec.VillageCode || ''}`,
    stateCode: rec.StateCode,
    state: rec.StateName || '',
    districtCode: rec.DistrictCode,
    district: rec.DistrictName || '',
    subDistrict: rec.SubDistrictName || '',
    blockCode: rec.BlockCode,
    block: rec.BlockName || '',
    villageCode: rec.VillageCode,
    village: rec.VillageName || '',
    maleBeneficiaries: male,
    femaleBeneficiaries: female,
    transgenderBeneficiaries: trans,
    totalBeneficiaries: total,
    financialYearId: rec.FinYearID,
    installmentReleaseNo: rec.InstallmentReleaseNo,
    quadrimesterNo: rec.QuadrimesterNo,
    period: {
      from: rec.QuadFromDate,
      to: rec.QuadEndDate,
    },
    scheme: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    raw: rec,
  };
};

/**
 * Compute aggregate summary statistics from records
 */
const computeSummaryStats = (records = []) => {
  let totalMale = 0;
  let totalFemale = 0;
  let totalTransgender = 0;
  let totalBeneficiaries = 0;

  for (const r of records) {
    const male = Number(r.MaleCount || r.maleBeneficiaries || 0);
    const female = Number(r.FemaleCount || r.femaleBeneficiaries || 0);
    const trans = Number(r.TransGenderCount || r.transgenderBeneficiaries || 0);

    totalMale += male;
    totalFemale += female;
    totalTransgender += trans;
    totalBeneficiaries += male + female + trans;
  }

  return {
    batchVillageCount: records.length,
    totalBeneficiaries,
    totalMale,
    totalFemale,
    totalTransgender,
  };
};

/**
 * Generates a cache key based on query parameters
 */
const buildCacheKey = (params) => {
  return JSON.stringify(params);
};

/**
 * Fetch Government Schemes Live Data from data.gov.in
 *
 * @param {Object} query
 * @param {number} [query.limit=50] - Number of records to fetch
 * @param {number} [query.offset=0] - Pagination offset
 * @param {string} [query.state] - State filter
 * @param {string} [query.district] - District filter
 * @param {string} [query.subDistrict] - Sub-district / Tehsil filter
 * @param {string} [query.block] - Block filter
 * @param {string} [query.village] - Village filter
 * @param {string} [query.search] - Search keyword across village/district/block/state
 * @param {boolean} [query.bypassCache=false] - If true, bypass memory cache
 */
const fetchGovSchemesData = async (query = {}) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  const state = query.state || query.StateName || '';
  const district = query.district || query.DistrictName || '';
  const subDistrict = query.subDistrict || query.SubDistrictName || '';
  const block = query.block || query.BlockName || '';
  const village = query.village || query.VillageName || '';
  const search = query.search ? query.search.trim().toLowerCase() : '';
  const bypassCache = query.bypassCache === true || query.refresh === 'true' || query.nocache === 'true';

  const cacheKey = buildCacheKey({ limit, offset, state, district, subDistrict, block, village, search });

  // 1. Check in-memory cache
  if (!bypassCache && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (Date.now() - cached.timestamp < config.dataGov.cacheTtlMs) {
      return {
        ...cached.data,
        metadata: {
          ...cached.data.metadata,
          isCached: true,
          cachedAt: new Date(cached.timestamp).toISOString(),
        },
      };
    }
  }

  // 2. Build Target URL for data.gov.in
  const { baseUrl, resourceId, apiKey } = config.dataGov;
  const targetUrl = new URL(`${baseUrl}/${resourceId}`);
  targetUrl.searchParams.set('api-key', apiKey);
  targetUrl.searchParams.set('format', 'json');
  targetUrl.searchParams.set('limit', String(limit));
  targetUrl.searchParams.set('offset', String(offset));

  if (state) targetUrl.searchParams.set('filters[StateName]', state.toUpperCase());
  if (district) targetUrl.searchParams.set('filters[DistrictName]', district.toUpperCase());
  if (subDistrict) targetUrl.searchParams.set('filters[SubDistrictName]', subDistrict);
  if (block) targetUrl.searchParams.set('filters[BlockName]', block.toUpperCase());
  if (village) targetUrl.searchParams.set('filters[VillageName]', village);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data.gov.in returned HTTP status ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    let rawRecords = payload.records || [];

    // Optional local fuzzy search if keyword provided
    if (search) {
      rawRecords = rawRecords.filter((rec) => {
        const v = (rec.VillageName || '').toLowerCase();
        const d = (rec.DistrictName || '').toLowerCase();
        const b = (rec.BlockName || '').toLowerCase();
        const s = (rec.StateName || '').toLowerCase();
        return v.includes(search) || d.includes(search) || b.includes(search) || s.includes(search);
      });
    }

    const normalizedRecords = rawRecords.map(normalizeBeneficiaryRecord);
    const summary = computeSummaryStats(rawRecords);

    const result = {
      metadata: {
        title: payload.title || 'Village and Gender - wise Beneficiaries Count under PM - KISAN Scheme',
        description: payload.desc || 'Village and Gender - wise Beneficiaries Count under PM - KISAN Scheme',
        organization: payload.org || ['Ministry of Agriculture and Farmers Welfare'],
        sector: payload.sector || ['Agriculture'],
        source: payload.source || 'data.gov.in',
        catalogUuid: payload.catalog_uuid || '',
        resourceId,
        totalRecords: Number(payload.total || 0),
        returnedCount: normalizedRecords.length,
        limit,
        offset,
        isCached: false,
        isFallback: false,
        fetchedAt: new Date().toISOString(),
      },
      summary,
      records: normalizedRecords,
    };

    // Save in cache
    memoryCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result,
    });

    return result;
  } catch (error) {
    logger.warn(`Error fetching live schemes data from data.gov.in: ${error.message}. Serving fallback/stale data.`);

    // If we have stale cache, serve it
    if (memoryCache.has(cacheKey)) {
      const stale = memoryCache.get(cacheKey);
      return {
        ...stale.data,
        metadata: {
          ...stale.data.metadata,
          isCached: true,
          isStale: true,
          error: error.message,
        },
      };
    }

    // Otherwise serve structured fallback response
    let fallbackRecords = FALLBACK_PM_KISAN_RECORDS;
    if (state) {
      fallbackRecords = fallbackRecords.filter((r) => r.StateName.toLowerCase() === state.toLowerCase());
    }
    if (district) {
      fallbackRecords = fallbackRecords.filter((r) => r.DistrictName.toLowerCase() === district.toLowerCase());
    }

    const normalizedFallback = fallbackRecords.map(normalizeBeneficiaryRecord);
    const summary = computeSummaryStats(fallbackRecords);

    return {
      metadata: {
        title: 'Village and Gender - wise Beneficiaries Count under PM - KISAN Scheme',
        description: 'Village and Gender - wise Beneficiaries Count under PM - KISAN Scheme (Local Fallback Cache)',
        organization: ['Ministry of Agriculture and Farmers Welfare', 'Department of Agriculture and Farmers Welfare'],
        sector: ['Agriculture'],
        source: 'data.gov.in',
        resourceId,
        totalRecords: fallbackRecords.length,
        returnedCount: normalizedFallback.length,
        limit,
        offset,
        isCached: false,
        isFallback: true,
        fallbackReason: error.message,
        fetchedAt: new Date().toISOString(),
      },
      summary,
      records: normalizedFallback,
    };
  }
};

/**
 * Get Schemes Catalog
 */
const getRuralSchemesCatalog = () => {
  return RURAL_SCHEMES_CATALOG;
};

/**
 * Get Scheme by ID
 */
const getSchemeById = async (id) => {
  if (!id) return null;
  const normalizedId = id.trim().toLowerCase();

  const found = RURAL_SCHEMES_CATALOG.find(
    (s) => s.id.toLowerCase() === normalizedId || s.code.toLowerCase() === normalizedId
  );

  if (!found) {
    return null;
  }

  // If this scheme has live data (e.g. PM-KISAN), attach latest sample snapshot
  if (found.hasLiveData) {
    try {
      const liveSnapshot = await fetchGovSchemesData({ limit: 5 });
      return {
        ...found,
        liveDataSnapshot: {
          metadata: liveSnapshot.metadata,
          summary: liveSnapshot.summary,
          sampleVillages: liveSnapshot.records.slice(0, 5),
        },
      };
    } catch {
      return found;
    }
  }

  return found;
};

/**
 * Get NGOs list
 */
const getNgos = () => {
  return RURAL_NGOS;
};

/**
 * Clear the in-memory cache (useful for testing or manual eviction)
 */
const clearCache = () => {
  memoryCache.clear();
};

module.exports = {
  fetchGovSchemesData,
  getRuralSchemesCatalog,
  getSchemeById,
  getNgos,
  clearCache,
  RURAL_SCHEMES_CATALOG,
  RURAL_NGOS,
};
