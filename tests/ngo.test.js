const request = require('supertest');
const app = require('../src/app');

describe('NGOs API Endpoints', () => {
  let createdNgoId;

  // ==========================================================================
  // 1. Categories & Stats
  // ==========================================================================
  describe('GET /api/v1/ngos/categories', () => {
    it('should return a list of NGO categories with counts', async () => {
      const res = await request(app).get('/api/v1/ngos/categories');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('count');
    });
  });

  describe('GET /api/v1/ngos/stats', () => {
    it('should return summary metrics on registered NGOs', async () => {
      const res = await request(app).get('/api/v1/ngos/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_ngos');
      expect(res.body.data).toHaveProperty('active_ngos');
      expect(res.body.data).toHaveProperty('unique_districts_covered');
      expect(res.body.data).toHaveProperty('unique_categories');
      expect(typeof res.body.data.total_ngos).toBe('number');
    });
  });

  // ==========================================================================
  // 2. View NGOs Directory
  // ==========================================================================
  describe('GET /api/v1/ngos', () => {
    it('should return 200 and a list of registered NGOs', async () => {
      const res = await request(app).get('/api/v1/ngos');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('ngos');
      expect(res.body.data).toHaveProperty('total');
      expect(Array.isArray(res.body.data.ngos)).toBe(true);
      expect(res.body.data.ngos.length).toBeGreaterThan(0);

      const first = res.body.data.ngos[0];
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('phone');
    });

    it('should filter NGOs by category', async () => {
      const res = await request(app).get('/api/v1/ngos?category=Agriculture');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const ngos = res.body.data.ngos;
      expect(ngos.length).toBeGreaterThan(0);
      expect(ngos.every((n) => n.category.toLowerCase().includes('agriculture'))).toBe(true);
    });

    it('should search NGOs by keyword in name, description, or services', async () => {
      const res = await request(app).get('/api/v1/ngos?search=organic');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ngos.length).toBeGreaterThan(0);
    });

    it('should calculate distance when lat and lng are provided', async () => {
      const res = await request(app).get('/api/v1/ngos?lat=19.578&lng=72.824&radius=100');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ngos.length).toBeGreaterThan(0);
    });

    it('should work via the /api/v1/ngo singular alias', async () => {
      const res = await request(app).get('/api/v1/ngo');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('ngos');
    });
  });

  // ==========================================================================
  // 3. Create NGO
  // ==========================================================================
  describe('POST /api/v1/ngos', () => {
    it('should return 400 if NGO name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/ngos')
        .send({ description: 'Missing name' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully register a new partner NGO', async () => {
      const payload = {
        name: 'Yuva Rural Development Foundation',
        description: 'Empowering tribal youth with vocational skills, organic beekeeping, and digital literacy.',
        category: 'Skill Development & Livelihoods',
        phone: '9822337711',
        email: 'info@yuvarural.org',
        website: 'https://yuvarural.org',
        address: 'Palghar-Manor Highway, Near ITI',
        state: 'Maharashtra',
        district: 'Palghar',
        village: 'Manor',
        latitude: 19.74,
        longitude: 72.91,
        services: 'Vocational Training, Honey Harvesting Training, Youth Scholarships',
      };

      const res = await request(app)
        .post('/api/v1/ngos')
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(payload.name);
      expect(res.body.data.category).toBe(payload.category);
      expect(res.body.data.phone).toBe(payload.phone);

      createdNgoId = res.body.data.id;
    });
  });

  // ==========================================================================
  // 4. View NGO Profile by ID
  // ==========================================================================
  describe('GET /api/v1/ngos/:id', () => {
    it('should return complete details for the created NGO', async () => {
      const res = await request(app).get(`/api/v1/ngos/${createdNgoId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdNgoId);
      expect(res.body.data.name).toBe('Yuva Rural Development Foundation');
      expect(res.body.data.email).toBe('info@yuvarural.org');
    });

    it('should return 404 for a non-existent NGO ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/v1/ngos/${fakeId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 5. Update NGO
  // ==========================================================================
  describe('PUT /api/v1/ngos/:id', () => {
    it('should update NGO details', async () => {
      const res = await request(app)
        .put(`/api/v1/ngos/${createdNgoId}`)
        .send({
          phone: '9822339900',
          services: 'Vocational Training, Beekeeping, Digital Literacy Labs',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('9822339900');
      expect(res.body.data.services).toContain('Digital Literacy Labs');
    });
  });

  // ==========================================================================
  // 6. Delete NGO
  // ==========================================================================
  describe('DELETE /api/v1/ngos/:id', () => {
    it('should deactivate or remove the NGO', async () => {
      const res = await request(app).delete(`/api/v1/ngos/${createdNgoId}?hard=true`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);

      // Verify 404 after deletion
      const checkRes = await request(app).get(`/api/v1/ngos/${createdNgoId}`);
      expect(checkRes.statusCode).toEqual(404);
    });
  });
});
