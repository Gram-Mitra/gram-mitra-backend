const config = require('../config');
const logger = require('../utils/logger');
const superstitionService = require('./superstition.service');
const healthcareService = require('./healthcare.service');
const schemeService = require('./scheme.service');
const problemService = require('./problem.service');

// In-memory call logs store (can also sync with Supabase)
const CALL_LOGS = [];

/**
 * Supported Mentor Profiles in Gram Mitra
 */
const MENTOR_PROFILES = [
  {
    id: 'krishi_mentor',
    name: 'Gram Krishi Mentor',
    title: 'Senior Agricultural & Soil Advisor',
    specialties: ['Crop Diseases & Pest Control', 'Fertilizer & Soil Health', 'Organic Farming', 'Irrigation'],
    languages: ['Hindi', 'Marathi', 'English'],
    avatar: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=256&q=80',
    welcomeMessage: 'Namaste! Main aapka Gram Krishi Mentor hoon. Fasal, beej, ya keet nashak se judi koi bhi samasya ho, bina jhijhak puchiye.',
  },
  {
    id: 'swasthya_mentor',
    name: 'Gram Swasthya & Pashu Mentor',
    title: 'Rural Healthcare & Veterinary Advisor',
    specialties: ['Emergency First Aid', 'Cattle & Livestock Care', 'Dispelling Superstitions', 'Nearby Hospital Guidance'],
    languages: ['Hindi', 'Marathi', 'English'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80',
    welcomeMessage: 'Namaste! Main aapka Swasthya aur Pashu Kalyan Mentor hoon. Bimaari, pashu dekhbhaal, ya andhavishwas se jude sawal puchiye.',
  },
  {
    id: 'gram_advisor',
    name: 'Gram Yojana & Vikas Mentor',
    title: 'Government Schemes & Village Development Advisor',
    specialties: ['Kisan Credit Card (KCC)', 'PM-Kisan & Subsidies', 'Reporting Village Problems', 'Water & Electricity Support'],
    languages: ['Hindi', 'Marathi', 'English'],
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=256&q=80',
    welcomeMessage: 'Namaste! Sarkari yojanaon aur gaon ki samasyaon se jude samadhan ke liye main aapki sahayata karunga.',
  },
];

class VoiceService {
  /**
   * 1. Get Mentor Session & Configuration
   * Prepares Vapi assistant credentials and personalized variables
   */
  async getMentorSession({ user = null, mentorType = 'krishi_mentor', language = 'hi' } = {}) {
    const selectedMentor =
      MENTOR_PROFILES.find((m) => m.id === mentorType) || MENTOR_PROFILES[0];

    const farmerName = user?.full_name || 'Kisan Mitra';
    const village = user?.village || 'Gram';
    const district = user?.district || 'Palghar';
    const state = user?.state || 'Maharashtra';

    const variableValues = {
      farmerName,
      village,
      district,
      state,
      mentorName: selectedMentor.name,
      mentorType: selectedMentor.id,
      language,
    };

    return {
      isConfigured: Boolean(config.vapi.publicKey && config.vapi.assistantId),
      publicKey: config.vapi.publicKey || 'demo_vapi_public_key',
      assistantId: config.vapi.assistantId || 'demo_vapi_assistant_id',
      selectedMentor,
      availableMentors: MENTOR_PROFILES,
      variableValues,
      sessionHints: {
        serverWebhookUrl: `/api/${config.apiVersion}/voice/webhook`,
        instructions: 'Use @vapi-ai/web in your frontend to start the call with the provided assistantId and variableValues.',
      },
    };
  }

  /**
   * 2. Execute Vapi Function / Tool Calls
   * Dispatches LLM function requests to live Gram Mitra database services
   */
  async executeToolCall(functionName, rawArgs) {
    let args = {};
    if (typeof rawArgs === 'string') {
      try {
        args = JSON.parse(rawArgs);
      } catch {
        args = { search: rawArgs };
      }
    } else if (rawArgs && typeof rawArgs === 'object') {
      args = rawArgs;
    }

    logger.info(`[Vapi Tool Call] Executing '${functionName}' with args:`, args);

    switch (functionName) {
      // Tool A: Superstition / Myth vs Fact Checker
      case 'checkMythVsFact':
      case 'superstition_check': {
        const query = args.search || args.topic || args.query || '';
        const category = args.category;
        const res = await superstitionService.getMyths({ search: query, category, limit: 1 });
        if (res && res.myths && res.myths.length > 0) {
          const item = res.myths[0];
          return {
            found: true,
            title: item.title,
            myth: item.myth,
            scientificFact: item.fact,
            explanation: item.explanation,
            source: item.source,
          };
        }
        return {
          found: false,
          message: `Koi pramanik andhavishwas ya myth record nahi mila '${query}' ke liye. Kripya nikat-tam Chikitsak ya Krishi Adhikari se salah lein.`,
        };
      }

      // Tool B: Search Healthcare & Veterinary Facilities
      case 'findNearbyHealthcare':
      case 'findHospital': {
        const type = args.type || 'human'; // 'human' or 'animal'
        const search = args.district || args.village || args.search || '';
        const res = await healthcareService.getFacilities({ type, search, limit: 2 });
        if (res && res.facilities && res.facilities.length > 0) {
          return {
            found: true,
            totalFound: res.total,
            facilities: res.facilities.map((f) => ({
              name: f.name,
              type: f.type === 'animal' ? 'Veterinary Hospital (Pashu Chikitsalay)' : 'Hospital (Swasthya Kendra)',
              address: f.address,
              village: f.village,
              district: f.district,
              phone: f.phone,
              isEmergency: f.is_emergency,
            })),
          };
        }
        return {
          found: false,
          message: `Nikat-tam ${type === 'animal' ? 'Pashu Aspatal' : 'Aspatal'} ki jankari uplabdh nahi hai. 108 emergency dial karein.`,
        };
      }

      // Tool C: Search Government Agricultural & Rural Schemes
      case 'getGovSchemes':
      case 'searchSchemes': {
        const search = args.search || args.crop || args.category || '';
        const res = await schemeService.getSchemes({ search, limit: 2 });
        if (res && res.records && res.records.length > 0) {
          return {
            found: true,
            schemes: res.records.map((s) => ({
              title: s.title,
              description: s.description,
              benefit: s.benefits || s.benefit,
              nodalMinistry: s.ministry || s.nodal_ministry,
            })),
          };
        }
        return {
          found: false,
          message: `Sarkari yojanaon mein '${search}' ke anuroop koi record nahi mila. Kripya Krishi Vibhag ya Gram Sevak se sampark karein.`,
        };
      }

      // Tool D: Report Village Problem (Water, Road, Electricity)
      case 'reportVillageProblem': {
        const title = args.title || 'Samasya report ki gayi';
        const category = args.category || 'other';
        const village = args.village || 'Gram';
        const district = args.district || 'District';
        const description = args.description || 'Voice agent dwara report darj ki gayi.';

        const created = await problemService.createProblem({
          title,
          category,
          village,
          district,
          description,
        });

        return {
          success: true,
          problemId: created.id,
          message: `Aapki samasya '${title}' Gram Mitra portal par safaltapurvak darj ho gayi hai. Sankhya: ${created.id}`,
        };
      }

      default:
        logger.warn(`[Vapi Tool Call] Unknown tool name: ${functionName}`);
        return {
          error: `Function ${functionName} is not registered in Gram Mitra backend`,
        };
    }
  }

  /**
   * 3. Handle End of Call Report from Vapi
   * Logs duration, AI transcript summary, and recording URL
   */
  async handleEndOfCallReport(reportData) {
    const {
      call,
      summary,
      transcript,
      durationSeconds,
      recordingUrl,
      endedReason,
      timestamp,
    } = reportData;

    const callLog = {
      id: call?.id || `call_${Date.now()}`,
      summary: summary || 'Call completed without summary',
      transcript: transcript || '',
      durationSeconds: durationSeconds || 0,
      recordingUrl: recordingUrl || null,
      endedReason: endedReason || 'normal',
      timestamp: timestamp || new Date().toISOString(),
    };

    CALL_LOGS.unshift(callLog);
    // Keep max 50 call logs in memory
    if (CALL_LOGS.length > 50) CALL_LOGS.pop();

    logger.info(`[Vapi End-of-Call] Duration: ${callLog.durationSeconds}s | Summary: ${callLog.summary}`);
    return callLog;
  }

  /**
   * 4. Retrieve Call Logs
   */
  async getCallLogs() {
    return CALL_LOGS;
  }
}

module.exports = new VoiceService();
