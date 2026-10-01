const request = require('supertest');
const app = require('../src/app');

describe('Village Problems API Endpoints', () => {
  let createdProblemId;

  // ==========================================================================
  // 1. Metadata & Stats
  // ==========================================================================
  describe('GET /api/v1/village-problems/metadata', () => {
    it('should return valid categories, statuses, and priorities for UI forms', async () => {
      const res = await request(app).get('/api/v1/village-problems/metadata');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('categories');
      expect(res.body.data).toHaveProperty('statuses');
      expect(res.body.data).toHaveProperty('priorities');
      expect(res.body.data.categories).toContain('water');
      expect(res.body.data.categories).toContain('electricity');
      expect(res.body.data.statuses).toContain('reported');
      expect(res.body.data.statuses).toContain('resolved');
    });
  });

  describe('GET /api/v1/village-problems/stats', () => {
    it('should return aggregate counts and resolution percentage', async () => {
      const res = await request(app).get('/api/v1/village-problems/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_problems');
      expect(res.body.data).toHaveProperty('resolution_rate_percent');
      expect(res.body.data).toHaveProperty('by_status');
      expect(res.body.data).toHaveProperty('by_category');
      expect(typeof res.body.data.total_problems).toBe('number');
    });
  });

  // ==========================================================================
  // 2. CREATE PROBLEM
  // ==========================================================================
  describe('POST /api/v1/village-problems (Create problem)', () => {
    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/village-problems')
        .send({ description: 'Missing title and category' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when an invalid category is provided', async () => {
      const res = await request(app)
        .post('/api/v1/village-problems')
        .send({
          title: 'Invalid category test',
          category: 'invalid_category_xyz',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully create a new village problem with initial update history', async () => {
      const payload = {
        title: 'Damaged Irrigation Canal Sluice Gate',
        description: 'The sluice gate on canal 3 near north field is stuck, blocking irrigation water.',
        category: 'agriculture',
        priority: 'high',
        village: 'Saphale',
        district: 'Palghar',
        latitude: 19.58,
        longitude: 72.83,
        initial_comment: 'Reported by local farmer group during morning inspection.',
      };

      const res = await request(app)
        .post('/api/v1/village-problems')
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.category).toBe('agriculture');
      expect(res.body.data.status).toBe('reported');
      expect(res.body.data.priority).toBe('high');
      expect(res.body.data).toHaveProperty('updates');
      expect(res.body.data.updates.length).toBeGreaterThanOrEqual(1);

      createdProblemId = res.body.data.id;
    });

    it('should also work with the /api/v1/problems route alias', async () => {
      const payload = {
        title: 'Broken Solar Streetlight on School Road',
        category: 'electricity',
        priority: 'low',
        village: 'Kelve',
        district: 'Palghar',
      };

      const res = await request(app)
        .post('/api/v1/problems')
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);

      // Clean up the alias-created item
      if (res.body.data?.id) {
        await request(app).delete(`/api/v1/problems/${res.body.data.id}`);
      }
    });
  });

  // ==========================================================================
  // 3. VIEW PROBLEMS
  // ==========================================================================
  describe('GET /api/v1/village-problems (View problems)', () => {
    it('should return 200 and a paginated list of village problems', async () => {
      const res = await request(app).get('/api/v1/village-problems');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('problems');
      expect(res.body.data).toHaveProperty('total');
      expect(Array.isArray(res.body.data.problems)).toBe(true);
      expect(res.body.data.problems.length).toBeGreaterThan(0);
    });

    it('should filter problems by category (e.g. water)', async () => {
      const res = await request(app).get('/api/v1/village-problems?category=water');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const problems = res.body.data.problems;
      expect(problems.every((p) => p.category === 'water')).toBe(true);
    });

    it('should filter problems by status', async () => {
      const res = await request(app).get('/api/v1/village-problems?status=reported');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const problems = res.body.data.problems;
      expect(problems.every((p) => p.status === 'reported')).toBe(true);
    });

    it('should search problems by keyword in title or description', async () => {
      const res = await request(app).get('/api/v1/village-problems?search=irrigation');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.problems.length).toBeGreaterThan(0);
    });

    it('should calculate distance when lat and lng are provided', async () => {
      const res = await request(app).get('/api/v1/village-problems?lat=19.577&lng=72.823&radius=50');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      if (res.body.data.problems.length > 0) {
        const first = res.body.data.problems[0];
        expect(first).toHaveProperty('distance_km');
      }
    });

    it('GET /api/v1/village-problems/:id should return single problem details', async () => {
      const res = await request(app).get(`/api/v1/village-problems/${createdProblemId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdProblemId);
      expect(res.body.data.title).toBe('Damaged Irrigation Canal Sluice Gate');
      expect(res.body.data).toHaveProperty('updates');
    });

    it('GET /api/v1/village-problems/:id should return 404 for non-existent ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/v1/village-problems/${fakeId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 4. UPDATE STATUS
  // ==========================================================================
  describe('PATCH /api/v1/village-problems/:id/status (Update status)', () => {
    it('should return 400 when an invalid status is submitted', async () => {
      const res = await request(app)
        .patch(`/api/v1/village-problems/${createdProblemId}/status`)
        .send({ status: 'invalid_status_xyz' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should transition status to under_review with comments', async () => {
      const res = await request(app)
        .patch(`/api/v1/village-problems/${createdProblemId}/status`)
        .send({
          status: 'under_review',
          comment: 'Gram Panchayat engineering officer visited site for inspection.',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.problem.status).toBe('under_review');
      expect(res.body.data).toHaveProperty('new_update');
      expect(res.body.data.new_update.status).toBe('under_review');
    });

    it('should transition status to in_progress with dispatch details', async () => {
      const res = await request(app)
        .patch(`/api/v1/village-problems/${createdProblemId}/status`)
        .send({
          status: 'in_progress',
          comment: 'Repair contractor assigned. Replacement sluice wheel ordered.',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.problem.status).toBe('in_progress');
    });

    it('should transition status to resolved and populate resolved_at', async () => {
      const res = await request(app)
        .patch(`/api/v1/village-problems/${createdProblemId}/status`)
        .send({
          status: 'resolved',
          comment: 'Sluice gate successfully replaced. Water flowing normally.',
          image_url: 'https://example.com/resolved_sluice_gate.jpg',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.problem.status).toBe('resolved');
      expect(res.body.data.problem.resolved_at).not.toBeNull();
    });

    it('PUT /api/v1/village-problems/:id should allow editing problem description and details', async () => {
      const res = await request(app)
        .put(`/api/v1/village-problems/${createdProblemId}`)
        .send({
          description: 'Updated description: North field canal sluice gate fully fixed and verified.',
          priority: 'medium',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.priority).toBe('medium');
    });
  });

  // ==========================================================================
  // 5. PROBLEM HISTORY
  // ==========================================================================
  describe('GET /api/v1/village-problems/:id/history (Problem history)', () => {
    it('should return the complete chronological audit trail of status changes', async () => {
      const res = await request(app).get(`/api/v1/village-problems/${createdProblemId}/history`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('problem_id', createdProblemId);
      expect(res.body.data).toHaveProperty('history');
      expect(res.body.data).toHaveProperty('total_updates');

      const history = res.body.data.history;
      expect(Array.isArray(history)).toBe(true);
      // We had: initial reported -> under_review -> in_progress -> resolved (at least 4 updates)
      expect(history.length).toBeGreaterThanOrEqual(4);

      const statuses = history.map((h) => h.status);
      expect(statuses).toContain('reported');
      expect(statuses).toContain('under_review');
      expect(statuses).toContain('in_progress');
      expect(statuses).toContain('resolved');

      // Verify updates contain comment and timestamp
      history.forEach((entry) => {
        expect(entry).toHaveProperty('status');
        expect(entry).toHaveProperty('created_at');
      });
    });

    it('should also work with the /api/v1/village-problems/:id/updates alias', async () => {
      const res = await request(app).get(`/api/v1/village-problems/${createdProblemId}/updates`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('history');
    });
  });

  // ==========================================================================
  // 6. CLEANUP & DELETE
  // ==========================================================================
  describe('DELETE /api/v1/village-problems/:id (Delete problem)', () => {
    it('should delete the problem and its associated updates', async () => {
      const res = await request(app).delete(`/api/v1/village-problems/${createdProblemId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);

      // Verify 404 after deletion
      const checkRes = await request(app).get(`/api/v1/village-problems/${createdProblemId}`);
      expect(checkRes.statusCode).toEqual(404);
    });
  });
});
