const request = require('supertest');
const app = require('../src/app');

jest.setTimeout(15000);

describe('Health & Root Endpoints', () => {
  it('GET / should return 200 and running message with status OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Gram Mitra Backend Running');
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('GET /api/v1/health should return 200 and status OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/v1/non-existent-route should return 404', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
  });
});
