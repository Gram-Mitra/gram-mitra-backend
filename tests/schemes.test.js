const request = require('supertest');
const app = require('../src/app');
const schemeService = require('../src/services/scheme.service');

describe('Government Schemes API Endpoints', () => {
  // Set longer timeout for external API calls
  jest.setTimeout(25000);

  beforeEach(() => {
    schemeService.clearCache();
  });

  describe('GET /api/v1/schemes', () => {
    it('should return 200 and government scheme beneficiary data from data.gov.in', async () => {
      const res = await request(app).get('/api/v1/schemes?limit=5');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('metadata');
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('records');
      expect(Array.isArray(res.body.data.records)).toBe(true);

      if (res.body.data.records.length > 0) {
        const record = res.body.data.records[0];
        expect(record).toHaveProperty('state');
        expect(record).toHaveProperty('district');
        expect(record).toHaveProperty('village');
        expect(record).toHaveProperty('maleBeneficiaries');
        expect(record).toHaveProperty('femaleBeneficiaries');
        expect(record).toHaveProperty('totalBeneficiaries');
        expect(typeof record.totalBeneficiaries).toBe('number');
      }
    });

    it('should support pagination and filtering parameters', async () => {
      const res = await request(app).get('/api/v1/schemes?limit=2&offset=1&state=MADHYA%20PRADESH');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metadata.limit).toBe(2);
      expect(res.body.data.metadata.offset).toBe(1);
      expect(res.body.data.records.length).toBeLessThanOrEqual(2);
    });

    it('should serve cached response on subsequent identical request', async () => {
      // First request populates cache
      const res1 = await request(app).get('/api/v1/schemes?limit=3');
      expect(res1.statusCode).toEqual(200);

      // Second request should be cached
      const res2 = await request(app).get('/api/v1/schemes?limit=3');
      expect(res2.statusCode).toEqual(200);
      expect(res2.body.data.metadata.isCached).toBe(true);
    });
  });

  describe('GET /api/v1/schemes/catalog', () => {
    it('should return curated list of major rural government schemes', async () => {
      const res = await request(app).get('/api/v1/schemes/catalog');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const schemeIds = res.body.data.map((s) => s.id);
      expect(schemeIds).toContain('pm-kisan');
      expect(schemeIds).toContain('pm-awas-yojana-gramin');
      expect(schemeIds).toContain('mgnrega');
      expect(schemeIds).toContain('pm-fasal-bima');
      expect(schemeIds).toContain('ayushman-bharat-pmjay');
    });
  });

  describe('GET /api/v1/schemes/stats', () => {
    it('should return aggregated beneficiary statistics', async () => {
      const res = await request(app).get('/api/v1/schemes/stats?limit=10');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data.summary).toHaveProperty('totalBeneficiaries');
      expect(res.body.data.summary).toHaveProperty('totalMale');
      expect(res.body.data.summary).toHaveProperty('totalFemale');
      expect(typeof res.body.data.summary.totalBeneficiaries).toBe('number');
    });
  });

  describe('GET /api/v1/schemes/ngos', () => {
    it('should return list of partner NGOs for rural scheme support', async () => {
      const res = await request(app).get('/api/v1/schemes/ngos');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('contact');
      expect(res.body.data[0]).toHaveProperty('helpProvided');
    });
  });

  describe('GET /api/v1/schemes/:id', () => {
    it('should return scheme details for a valid scheme ID', async () => {
      const res = await request(app).get('/api/v1/schemes/pm-kisan');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 'pm-kisan');
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('eligibility');
      expect(res.body.data).toHaveProperty('benefits');
    });

    it('should return 404 for an unknown scheme ID', async () => {
      const res = await request(app).get('/api/v1/schemes/non-existent-scheme-999');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });
  });
});
