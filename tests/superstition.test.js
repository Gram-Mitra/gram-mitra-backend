const request = require('supertest');
const app = require('../src/app');

jest.setTimeout(15000);

describe('Superstition / Myth vs Fact API Endpoints', () => {
  let createdMythId;

  // ==========================================================================
  // 1. Categories & Stats
  // ==========================================================================
  describe('GET /api/v1/superstitions/categories', () => {
    it('should return a list of myth categories with item counts', async () => {
      const res = await request(app).get('/api/v1/superstitions/categories');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('count');
    });
  });

  describe('GET /api/v1/superstitions/stats', () => {
    it('should return summary metrics on recorded myths and facts', async () => {
      const res = await request(app).get('/api/v1/superstitions/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_myths');
      expect(res.body.data).toHaveProperty('verified_myths');
      expect(res.body.data).toHaveProperty('unique_categories');
      expect(res.body.data).toHaveProperty('unique_languages');
      expect(typeof res.body.data.total_myths).toBe('number');
      expect(res.body.data.total_myths).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 2. Random / Featured Myth
  // ==========================================================================
  describe('GET /api/v1/superstitions/random', () => {
    it('should return a single random myth vs fact', async () => {
      const res = await request(app).get('/api/v1/superstitions/random');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('myth');
      expect(res.body.data).toHaveProperty('fact');
    });

    it('should return a random myth filtered by category', async () => {
      const res = await request(app).get('/api/v1/superstitions/random?category=Healthcare');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.toLowerCase()).toContain('healthcare');
    });
  });

  // ==========================================================================
  // 3. Collection & Filtering
  // ==========================================================================
  describe('GET /api/v1/superstitions', () => {
    it('should return 200 and a list of myths vs facts with pagination metadata', async () => {
      const res = await request(app).get('/api/v1/superstitions');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('myths');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page');
      expect(res.body.data).toHaveProperty('limit');
      expect(Array.isArray(res.body.data.myths)).toBe(true);
      expect(res.body.data.myths.length).toBeGreaterThan(0);

      const first = res.body.data.myths[0];
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('myth');
      expect(first).toHaveProperty('fact');
    });

    it('should filter myths by category', async () => {
      const res = await request(app).get('/api/v1/superstitions?category=Animal%20Husbandry');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const myths = res.body.data.myths;
      expect(myths.length).toBeGreaterThan(0);
      expect(myths.every((m) => m.category.toLowerCase().includes('animal'))).toBe(true);
    });

    it('should filter myths by language (Hindi)', async () => {
      const res = await request(app).get('/api/v1/superstitions?language=hi');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const myths = res.body.data.myths;
      expect(myths.length).toBeGreaterThan(0);
      expect(myths.every((m) => m.language === 'hi')).toBe(true);
    });

    it('should search myths by keyword', async () => {
      const res = await request(app).get('/api/v1/superstitions?search=snake');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.myths.length).toBeGreaterThan(0);
      const matched = res.body.data.myths[0];
      const text = `${matched.title} ${matched.myth} ${matched.fact}`.toLowerCase();
      expect(text).toContain('snake');
    });

    it('should paginate results with limit and page', async () => {
      const res = await request(app).get('/api/v1/superstitions?limit=2&page=1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.myths.length).toBeLessThanOrEqual(2);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(2);
    });

    it('should work via the /api/v1/myths plural alias', async () => {
      const res = await request(app).get('/api/v1/myths');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('myths');
    });

    it('should work via the /api/v1/superstition singular alias', async () => {
      const res = await request(app).get('/api/v1/superstition');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('myths');
    });
  });

  // ==========================================================================
  // 4. Create Myth vs Fact Entry
  // ==========================================================================
  describe('POST /api/v1/superstitions', () => {
    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/v1/superstitions')
        .send({
          myth: 'Test myth without title',
          fact: 'Test fact',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if myth text is missing', async () => {
      const res = await request(app)
        .post('/api/v1/superstitions')
        .send({
          title: 'Test Title',
          fact: 'Test fact',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if fact text is missing', async () => {
      const res = await request(app)
        .post('/api/v1/superstitions')
        .send({
          title: 'Test Title',
          myth: 'Test myth',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully create a new myth vs fact entry with 201', async () => {
      const newMyth = {
        title: 'Drinking Raw Milk Directly from Infected Cattle Cures Asthma',
        myth: 'Drinking warm raw milk directly from a cow with mastitis transfers healing antibodies that cure respiratory asthma.',
        fact: 'Raw unpasteurized milk from diseased cattle spreads deadly Zoonotic Tuberculosis (Mycobacterium bovis) and Brucellosis.',
        explanation: 'Pasteurization or boiling milk kills pathogenic bacteria. Ingesting raw infected milk leads to extra-pulmonary tuberculosis and severe chronic fever.',
        category: 'Healthcare',
        language: 'en',
        source: 'Food Safety and Standards Authority of India (FSSAI) & WHO',
        is_verified: true,
      };

      const res = await request(app)
        .post('/api/v1/superstitions')
        .send(newMyth);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(newMyth.title);
      expect(res.body.data.myth).toBe(newMyth.myth);
      expect(res.body.data.fact).toBe(newMyth.fact);

      createdMythId = res.body.data.id;
    });
  });

  // ==========================================================================
  // 5. Retrieve Single Item
  // ==========================================================================
  describe('GET /api/v1/superstitions/:id', () => {
    it('should retrieve the newly created myth entry by ID', async () => {
      expect(createdMythId).toBeDefined();

      const res = await request(app).get(`/api/v1/superstitions/${createdMythId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdMythId);
      expect(res.body.data.category).toBe('Healthcare');
    });

    it('should return 404 for non-existent UUID', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000999';
      const res = await request(app).get(`/api/v1/superstitions/${nonExistentUuid}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 6. Update Myth vs Fact
  // ==========================================================================
  describe('PUT /api/v1/superstitions/:id', () => {
    it('should update myth title and source', async () => {
      expect(createdMythId).toBeDefined();

      const res = await request(app)
        .put(`/api/v1/superstitions/${createdMythId}`)
        .send({
          title: 'Drinking Raw Milk Directly from Cattle Does NOT Cure Asthma',
          source: 'FSSAI, ICMR, and WHO Joint Advisory 2026',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Drinking Raw Milk Directly from Cattle Does NOT Cure Asthma');
      expect(res.body.data.source).toBe('FSSAI, ICMR, and WHO Joint Advisory 2026');
    });

    it('should return 404 when updating non-existent myth', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000999';
      const res = await request(app)
        .put(`/api/v1/superstitions/${nonExistentUuid}`)
        .send({ title: 'Non-existent' });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 7. Verify Myth Status
  // ==========================================================================
  describe('PATCH /api/v1/superstitions/:id/verify', () => {
    it('should mark entry as verified with authority source', async () => {
      expect(createdMythId).toBeDefined();

      const res = await request(app)
        .patch(`/api/v1/superstitions/${createdMythId}/verify`)
        .send({
          is_verified: true,
          source: 'National Institute of Nutrition (NIN)',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_verified).toBe(true);
      expect(res.body.data.source).toBe('National Institute of Nutrition (NIN)');
    });
  });

  // ==========================================================================
  // 8. Delete Myth
  // ==========================================================================
  describe('DELETE /api/v1/superstitions/:id', () => {
    it('should delete the created myth entry', async () => {
      expect(createdMythId).toBeDefined();

      const res = await request(app).delete(`/api/v1/superstitions/${createdMythId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when fetching the deleted myth', async () => {
      const res = await request(app).get(`/api/v1/superstitions/${createdMythId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });
});
