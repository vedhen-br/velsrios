const request = require('supertest');
const app = require('../src/server/index');

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/info', () => {
    it('should return platform info', async () => {
      const res = await request(app).get('/api/info');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Velsrios Platform');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('description');
    });
  });

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/notfound', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/notfound');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
