const { supabase, supabaseAdmin, TABLES } = require('../config/supabase');
const logger = require('../utils/logger');

// UUID format validator
const isValidUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * Fallback dataset for Superstition / Myth vs Fact
 * Realistic, culturally relevant rural Indian myths & scientific facts
 */
const FALLBACK_MYTHS = [
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000001',
    title: 'Treating Snakebites with Incantations or Sucking Venom',
    myth: 'Cutting the wound, sucking out venom with mouth, or chanting mantras by a quack (ojha/tantrik) can neutralize a snakebite.',
    fact: 'Only Anti-Snake Venom (ASV) administered at a government hospital or PHC can neutralize venom. Sucking or cutting causes severe infection and tissue necrosis.',
    explanation: 'Over 70% of snake species in India are non-venomous. When victims survive non-venomous bites, quacks falsely take credit. For venomous bites (Cobra, Russell\'s Viper, Krait), delaying ASV for incantations leads to fatal respiratory failure.',
    category: 'Healthcare',
    language: 'en',
    image_url: null,
    source: 'ICMR & World Health Organization (WHO)',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000002',
    title: 'Hot Iron Branding to Cure Sick Cattle',
    myth: 'Branding diseased cattle with red-hot iron sickles cures bloat, fever, joint swellings, or foot-and-mouth disease.',
    fact: 'Branding inflicts third-degree burns, shock, and bacterial infections without addressing the viral or metabolic illness. Modern veterinary care and vaccinations are the only cure.',
    explanation: 'Branding is an agonizing superstition with zero medical benefit. Foot-and-mouth disease (FMD) and bloat require veterinary antibiotics, antiseptic washes, and scheduled vaccinations under the National Animal Disease Control Programme.',
    category: 'Animal Husbandry',
    language: 'en',
    image_url: null,
    source: 'Department of Animal Husbandry & Dairying (DAHD), Govt of India',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000003',
    title: 'Curing Jaundice with Herbal Garlands (Piliya Mala)',
    myth: 'Wearing yellow root garlands, putting lime on nails, or avoiding all turmeric cures jaundice.',
    fact: 'Jaundice is caused by elevated bilirubin from viral hepatitis (A or E from contaminated water) or liver dysfunction. Garlands have zero medical effect. Rest, safe drinking water, and medical care are needed.',
    explanation: 'Viral Hepatitis A and E are self-limiting within 2-4 weeks. As liver enzymes naturally recover, quacks falsely claim the garland absorbed the yellow bile pigment.',
    category: 'Healthcare',
    language: 'en',
    image_url: null,
    source: 'National Viral Hepatitis Control Program (NVHCP) & ICMR',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000004',
    title: 'Applying Red Chili Powder or Kerosene to Animal Bites',
    myth: 'Applying red chili powder, acid, battery water, or chewing leaves prevents rabies after a dog or monkey bite.',
    fact: 'Applying irritants damages tissue and speeds up viral entry. Rabies is 100% fatal once symptoms appear, but 100% preventable with immediate soap-and-water washing and timely Anti-Rabies Vaccine (ARV).',
    explanation: 'Washing the animal bite vigorously with soap and running water for 15 minutes washes away up to 90% of the rabies virus. Receiving the full course of post-exposure rabies vaccines at a health centre is mandatory.',
    category: 'Healthcare',
    language: 'en',
    image_url: null,
    source: 'WHO Rabies Guidelines & National Center for Disease Control (NCDC)',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000005',
    title: 'Mixing Multiple Chemical Pesticides Yields Superior Kill',
    myth: 'Mixing 3 to 4 chemical pesticides at double strength kills all crop pests and guarantees highest harvest yield.',
    fact: 'Pesticide cocktails scorch crop foliage (phytotoxicity), kill friendly predator insects (spiders, ladybird beetles), trigger pest resurgence, and poison groundwater.',
    explanation: 'Excessive chemical cocktails breed pesticide resistance in pests like whitefly and pink bollworm. Integrated Pest Management (IPM), pheromone traps, and government recommended doses are more economical and effective.',
    category: 'Agriculture',
    language: 'en',
    image_url: null,
    source: 'Indian Council of Agricultural Research (ICAR)',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000006',
    title: 'Discarding Mother\'s First Milk (Colostrum / Khees)',
    myth: 'Colostrum (thick yellowish first breast milk) is heavy, stale, toxic, and should be milked out and thrown away.',
    fact: 'Colostrum is the baby\'s first natural vaccine. It is packed with maternal antibodies (Secretory IgA) that coat the infant\'s intestines and protect against diarrhea and neonatal infections.',
    explanation: 'Discarding colostrum robs the infant of crucial early immunity and increases infant mortality risk. UNICEF and the Ministry of Health advise initiating breastfeeding within the first golden hour after birth.',
    category: 'Child Health & Nutrition',
    language: 'en',
    image_url: null,
    source: 'Ministry of Health & Family Welfare & UNICEF India',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000007',
    title: 'Pregnant Women Going Outdoors During Eclipses Causes Cleft Lip',
    myth: 'A pregnant woman stepping out or cutting vegetables during a solar or lunar eclipse causes cleft lip or birth deformities.',
    fact: 'An eclipse is purely a celestial alignment of celestial bodies casting shadows. Gravity and light fluctuations during an eclipse do not cause congenital birth defects.',
    explanation: 'Cleft lips and neural tube defects are caused by genetic predispositions and maternal folic acid deficiency in early pregnancy. Routine prenatal folic acid supplements prevent these deformities.',
    category: 'Social Taboos',
    language: 'en',
    image_url: null,
    source: 'Federation of Obstetric and Gynaecological Societies of India (FOGSI)',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000008',
    title: 'Menstruating Women Must Not Enter Kitchen or Touch Pickles',
    myth: 'Menstruating women are impure and touching pickles or farm produce will cause them to rot and spoil.',
    fact: 'Menstruation is a natural biological reproductive cycle. Pickles spoil due to moisture contamination or fungal spores, not due to menstrual touch.',
    explanation: 'Pickle fermentation depends on salinity, oil layer protection, and moisture-free handling. Taboos around menstruation perpetuate unhygienic practices and isolate young girls from school.',
    category: 'Social Taboos',
    language: 'en',
    image_url: null,
    source: 'National Health Mission (NHM) Menstrual Hygiene Scheme',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000009',
    title: 'सांप के काटने पर झाड़-फूंक और चीरा लगाना',
    myth: 'सांप के काटने पर ओझा या तांत्रिक से झाड़-फूंक कराने या घाव पर चीरा लगाकर जहर चूसने से मरीज ठीक हो जाता है।',
    fact: 'झाड़-फूंक में समय बर्बाद करना जानलेवा हो सकता है। प्राथमिक स्वास्थ्य केंद्र (PHC) या अस्पताल जाकर तुरंत एंटी-स्नेक वेनम (ASV) का इंजेक्शन लगवाना ही एकमात्र वैज्ञानिक इलाज है।',
    explanation: 'भारत में अधिकतर सांप विषैले नहीं होते हैं, इसलिए झाड़-फूंक वाले झूठा श्रेय ले लेते हैं। विषैले सांप के काटने पर केवल सरकारी अस्पताल में उपलब्ध एंटी-वेनम ही जान बचा सकता है।',
    category: 'Healthcare',
    language: 'hi',
    image_url: null,
    source: 'ICMR & National Health Mission (NHM)',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000010',
    title: 'नवजात शिशु को मां का पहला पीला गाढ़ा दूध न देना',
    myth: 'पहला पीला दूध (खीस/कोलोस्ट्रम) गंदा और भारी होता है, इसलिए इसे फेंक देना चाहिए।',
    fact: 'मां का पहला पीला गाढ़ा दूध बच्चे का पहला प्राकृतिक टीका है। इसमें प्रचुर मात्रा में एंटीबॉडीज होते हैं जो शिशु को संक्रमण और निमोनिया से बचाते हैं।',
    explanation: 'कोलोस्ट्रम को फेंकने से नवजात शिशु की रोग प्रतिरोधक क्षमता कमजोर हो जाती है। जन्म के 1 घंटे के भीतर शिशु को स्तनपान कराना अति आवश्यक है।',
    category: 'Child Health & Nutrition',
    language: 'hi',
    image_url: null,
    source: 'यूनिसेफ एवं स्वास्थ्य और परिवार कल्याण मंत्रालय',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000011',
    title: 'आजारी जनावरांना गरम लोखंडाने चटके (डाग) देणे',
    myth: 'गाय किंवा म्हशी आजारी पडल्यास किंवा त्यांचे पाय दुखत असल्यास त्यांना गरम लोखंडाने चटके दिल्यास त्या बऱ्या होतात.',
    fact: 'डाग दिल्याने प्राण्याला असह्य वेदना आणि जंतुसंसर्ग होतो. आजारी जनावरांना तात्काळ पशुवैद्यकीय डॉक्टरांकडून तपासून औषधोपचार करा.',
    explanation: 'डाग देणे ही एक अमानुष अंधश्रद्धा आहे. लाळ्या खुरकूत किंवा इतर संसर्गजन्य आजारांवर योग्य लसीकरण आणि पशुवैद्यकीय औषधेच प्रभावी ठरतात.',
    category: 'Animal Husbandry',
    language: 'mr',
    image_url: null,
    source: 'महाराष्ट्र पशुसंवर्धन विभाग',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000012',
    title: 'Childhood Immunization Causes Infertility or Sickness',
    myth: 'Vaccines given by ASHA or ANM workers make children sick, cause fever, or lead to future infertility.',
    fact: 'Vaccines undergo rigorous safety trials. Mild fever is a temporary sign that the immune system is learning to fight off deadly diseases like Polio, Measles, and Tetanus.',
    explanation: 'Mission Indradhanush ensures all children are protected against 12 life-threatening vaccine-preventable diseases. Vaccines have saved hundreds of millions of children globally.',
    category: 'Healthcare',
    language: 'en',
    image_url: null,
    source: 'Universal Immunization Programme (UIP) & WHO',
    is_verified: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
];

class SuperstitionService {
  getClient() {
    return supabaseAdmin || supabase || null;
  }

  /**
   * 1. GET ALL MYTHS (List, Filter, Search, Pagination, Sort)
   */
  async getMyths({
    category,
    language,
    search,
    is_verified,
    limit = 20,
    offset = 0,
    page,
    sort = 'created_at',
    order = 'desc',
  } = {}) {
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedOffset = page ? (Math.max(parseInt(page, 10), 1) - 1) * parsedLimit : Math.max(parseInt(offset, 10) || 0, 0);

    const allowedSortFields = ['created_at', 'updated_at', 'title', 'category'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const client = this.getClient();

    if (client) {
      try {
        let query = client.from(TABLES.MYTHS).select('*');

        if (category && category !== 'all') {
          query = query.ilike('category', `%${category}%`);
        }
        if (language) {
          query = query.eq('language', language);
        }
        if (is_verified !== undefined && is_verified !== '') {
          const verifiedBool = is_verified === 'true' || is_verified === true;
          query = query.eq('is_verified', verifiedBool);
        }

        query = query.order(sortField, { ascending: sortOrder === 'asc' });

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          let myths = data;

          // If database table is empty, seed fallback in memory for smooth user experience
          if (myths.length === 0) {
            myths = JSON.parse(JSON.stringify(FALLBACK_MYTHS));
            if (category && category !== 'all') {
              myths = myths.filter((m) => m.category.toLowerCase().includes(category.toLowerCase()));
            }
            if (language) {
              myths = myths.filter((m) => m.language === language);
            }
            if (is_verified !== undefined && is_verified !== '') {
              const wantVerified = is_verified === 'true' || is_verified === true;
              myths = myths.filter((m) => m.is_verified === wantVerified);
            }
          }

          // Full-text keyword search across title, myth, fact, explanation, category
          if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            myths = myths.filter((m) =>
              (m.title && m.title.toLowerCase().includes(s)) ||
              (m.myth && m.myth.toLowerCase().includes(s)) ||
              (m.fact && m.fact.toLowerCase().includes(s)) ||
              (m.explanation && m.explanation.toLowerCase().includes(s)) ||
              (m.category && m.category.toLowerCase().includes(s))
            );
          }

          const total = myths.length;
          const paginated = myths.slice(parsedOffset, parsedOffset + parsedLimit);

          return {
            total,
            limit: parsedLimit,
            offset: parsedOffset,
            page: Math.floor(parsedOffset / parsedLimit) + 1,
            totalPages: Math.ceil(total / parsedLimit) || 1,
            myths: paginated,
          };
        }
      } catch (err) {
        logger.warn('Supabase myths query failed, using fallback:', err.message);
      }
    }

    // Fallback in-memory dataset
    let fallback = JSON.parse(JSON.stringify(FALLBACK_MYTHS));

    if (category && category !== 'all') {
      fallback = fallback.filter((m) => m.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (language) {
      fallback = fallback.filter((m) => m.language === language);
    }
    if (is_verified !== undefined && is_verified !== '') {
      const wantVerified = is_verified === 'true' || is_verified === true;
      fallback = fallback.filter((m) => m.is_verified === wantVerified);
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      fallback = fallback.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(s)) ||
          (m.myth && m.myth.toLowerCase().includes(s)) ||
          (m.fact && m.fact.toLowerCase().includes(s)) ||
          (m.explanation && m.explanation.toLowerCase().includes(s)) ||
          (m.category && m.category.toLowerCase().includes(s))
      );
    }

    fallback.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (sortOrder === 'asc') return aVal < bVal ? -1 : 1;
      return aVal > bVal ? -1 : 1;
    });

    const total = fallback.length;
    const paginated = fallback.slice(parsedOffset, parsedOffset + parsedLimit);

    return {
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      page: Math.floor(parsedOffset / parsedLimit) + 1,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      myths: paginated,
    };
  }

  /**
   * 2. GET MYTH BY ID
   */
  async getMythById(id) {
    if (!id) {
      const error = new Error('Myth ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        const { data, error } = await client
          .from(TABLES.MYTHS)
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        logger.warn(`Error fetching myth ${id} from Supabase:`, err.message);
      }
    }

    const myth = FALLBACK_MYTHS.find((m) => m.id === id);
    if (!myth) {
      const error = new Error(`Myth with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return myth;
  }

  /**
   * 3. GET CATEGORIES with counts
   */
  async getCategories() {
    const client = this.getClient();
    let myths;

    if (client) {
      try {
        const { data, error } = await client.from(TABLES.MYTHS).select('category');
        if (!error && Array.isArray(data) && data.length > 0) {
          myths = data;
        }
      } catch (err) {
        logger.warn('Failed fetching myth categories from Supabase:', err.message);
      }
    }

    if (!myths || myths.length === 0) {
      myths = FALLBACK_MYTHS;
    }

    const counts = {};
    myths.forEach((m) => {
      const cat = m.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 4. GET STATS
   */
  async getStats() {
    const client = this.getClient();
    let myths;

    if (client) {
      try {
        const { data, error } = await client.from(TABLES.MYTHS).select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          myths = data;
        }
      } catch (err) {
        logger.warn('Failed fetching myth stats from Supabase:', err.message);
      }
    }

    if (!myths || myths.length === 0) {
      myths = FALLBACK_MYTHS;
    }

    const categories = [...new Set(myths.map((m) => m.category).filter(Boolean))];
    const languages = [...new Set(myths.map((m) => m.language).filter(Boolean))];
    const verifiedCount = myths.filter((m) => m.is_verified).length;

    return {
      total_myths: myths.length,
      verified_myths: verifiedCount,
      unverified_myths: myths.length - verifiedCount,
      unique_categories: categories.length,
      unique_languages: languages.length,
      categories,
      languages,
    };
  }

  /**
   * 5. GET RANDOM / FEATURED MYTH
   */
  async getRandomMyth({ category, language } = {}) {
    const { myths } = await this.getMyths({
      category,
      language,
      limit: 100,
      offset: 0,
    });

    if (!myths || myths.length === 0) {
      const error = new Error('No myths found matching the criteria');
      error.statusCode = 404;
      throw error;
    }

    return myths[Math.floor(Math.random() * myths.length)];
  }

  /**
   * 6. CREATE MYTH (Add New Myth vs Fact Entry)
   */
  async createMyth(data) {
    const {
      title,
      myth,
      fact,
      explanation,
      category,
      language = 'en',
      image_url,
      source,
      is_verified = true,
    } = data;

    if (!title || !String(title).trim()) {
      const error = new Error('Myth title is required');
      error.statusCode = 400;
      throw error;
    }
    if (!myth || !String(myth).trim()) {
      const error = new Error('Myth description is required');
      error.statusCode = 400;
      throw error;
    }
    if (!fact || !String(fact).trim()) {
      const error = new Error('Fact description is required');
      error.statusCode = 400;
      throw error;
    }

    const payload = {
      title: String(title).trim(),
      myth: String(myth).trim(),
      fact: String(fact).trim(),
      explanation: explanation ? String(explanation).trim() : null,
      category: category ? String(category).trim() : 'General',
      language: language ? String(language).trim().toLowerCase() : 'en',
      image_url: image_url ? String(image_url).trim() : null,
      source: source ? String(source).trim() : null,
      is_verified: is_verified !== undefined ? Boolean(is_verified) : true,
    };

    const client = this.getClient();

    if (!client) {
      const mockId = require('crypto').randomUUID();
      const mockMyth = {
        id: mockId,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      FALLBACK_MYTHS.unshift(mockMyth);
      return mockMyth;
    }

    try {
      const { data: created, error } = await client
        .from(TABLES.MYTHS)
        .insert(payload)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create myth in Supabase:', error.message);
        throw error;
      }

      return created;
    } catch (insertErr) {
      // In case Supabase fails or credentials restricted, maintain in-memory fallback
      logger.warn('Supabase insert failed, applying fallback in-memory entry:', insertErr.message);
      const mockId = require('crypto').randomUUID();
      const mockMyth = {
        id: mockId,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      FALLBACK_MYTHS.unshift(mockMyth);
      return mockMyth;
    }
  }

  /**
   * 7. UPDATE MYTH
   */
  async updateMyth(id, data) {
    if (!id) {
      const error = new Error('Myth ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        const { data: existing } = await client
          .from(TABLES.MYTHS)
          .select('id')
          .eq('id', id)
          .maybeSingle();

        if (existing) {
          const updatePayload = { updated_at: new Date().toISOString() };
          if (data.title !== undefined) updatePayload.title = String(data.title).trim();
          if (data.myth !== undefined) updatePayload.myth = String(data.myth).trim();
          if (data.fact !== undefined) updatePayload.fact = String(data.fact).trim();
          if (data.explanation !== undefined) updatePayload.explanation = data.explanation ? String(data.explanation).trim() : null;
          if (data.category !== undefined) updatePayload.category = data.category ? String(data.category).trim() : null;
          if (data.language !== undefined) updatePayload.language = data.language ? String(data.language).trim().toLowerCase() : 'en';
          if (data.image_url !== undefined) updatePayload.image_url = data.image_url ? String(data.image_url).trim() : null;
          if (data.source !== undefined) updatePayload.source = data.source ? String(data.source).trim() : null;
          if (data.is_verified !== undefined) updatePayload.is_verified = Boolean(data.is_verified);

          const { data: updated, error: updateError } = await client
            .from(TABLES.MYTHS)
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

          if (!updateError && updated) {
            return updated;
          }
        }
      } catch (err) {
        logger.warn(`Error updating myth in Supabase ${id}:`, err.message);
      }
    }

    // Check fallback
    const myth = FALLBACK_MYTHS.find((m) => m.id === id);
    if (!myth) {
      const error = new Error(`Myth with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    Object.assign(myth, data, { updated_at: new Date().toISOString() });
    return myth;
  }

  /**
   * 8. DELETE MYTH
   */
  async deleteMyth(id) {
    if (!id) {
      const error = new Error('Myth ID is required');
      error.statusCode = 400;
      throw error;
    }

    const client = this.getClient();

    if (client && isValidUUID(id)) {
      try {
        const { data: existing } = await client
          .from(TABLES.MYTHS)
          .select('id')
          .eq('id', id)
          .maybeSingle();

        if (existing) {
          const { error: deleteError } = await client
            .from(TABLES.MYTHS)
            .delete()
            .eq('id', id);

          if (!deleteError) {
            return { id, deleted: true };
          }
        }
      } catch (err) {
        logger.warn(`Error deleting myth in Supabase ${id}:`, err.message);
      }
    }

    const idx = FALLBACK_MYTHS.findIndex((m) => m.id === id);
    if (idx === -1) {
      const error = new Error(`Myth with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    FALLBACK_MYTHS.splice(idx, 1);
    return { id, deleted: true };
  }

  /**
   * 9. VERIFY MYTH
   */
  async verifyMyth(id, isVerified = true, source = null) {
    const updateData = { is_verified: Boolean(isVerified) };
    if (source) {
      updateData.source = String(source).trim();
    }
    return this.updateMyth(id, updateData);
  }
}

module.exports = new SuperstitionService();
