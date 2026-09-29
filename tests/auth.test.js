const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints (/api/v1/auth)', () => {
  const testEmail = `test_${Date.now()}@grammitra.test`;
  const testPassword = 'Password123!';
  const testPhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;

  let accessToken = null;

  describe('Validation & Error Handling', () => {
    it('POST /register should reject request without password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'no_password@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/password/i);
    });

    it('POST /register should reject request without email or phone', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          password: 'Password123!',
          fullName: 'Test User',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/email or phone/i);
    });

    it('POST /login should reject request without password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'sample@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/password/i);
    });

    it('POST /login should reject invalid credentials with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'non_existent_user_999@example.com',
          password: 'WrongPassword123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /me should return 401 when token is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('End-to-End Registration & Login against Supabase', () => {
    it('POST /register should successfully create user and profile in Supabase', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          phone: testPhone,
          fullName: 'Ramesh Patel',
          age: 35,
          state: 'Maharashtra',
          district: 'Pune',
          village: 'Baramati',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.full_name).toBe('Ramesh Patel');
      expect(res.body.data.user.district).toBe('Pune');

      if (res.body.data.session) {
        accessToken = res.body.data.session.access_token;
      }
    });

    it('POST /login should successfully authenticate and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('session');
      expect(res.body.data.session).toHaveProperty('access_token');
      expect(res.body.data.user.email).toBe(testEmail);

      accessToken = res.body.data.session.access_token;
    });

    it('GET /me should return the authenticated user profile with Bearer token', async () => {
      if (!accessToken) return;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.full_name).toBe('Ramesh Patel');
      expect(res.body.data.user.village).toBe('Baramati');
    });
  });
});
