import request from 'supertest';
import app from '../app';
import { Website } from '../models';

const adminAuth = 'Bearer test-admin-password';

describe('Website API', () => {
  describe('POST /api/websites', () => {
    it('should create a new website', async () => {
      const websiteData = {
        publishId: 'test-publish-id-123',
        name: 'Wedding Website',
        description: 'Our beautiful wedding site',
      };

      const response = await request(app)
        .post('/api/websites')
        .set('Authorization', adminAuth)
        .send(websiteData);

      expect(response.status).toBe(201);
      expect(response.body.publishId).toBe(websiteData.publishId);
      expect(response.body.name).toBe(websiteData.name);
      expect(response.body.isActive).toBe(true);
    });

    it('should return 409 for duplicate publishId', async () => {
      const websiteData = {
        publishId: 'duplicate-id',
        name: 'First Website',
      };

      await request(app)
        .post('/api/websites')
        .set('Authorization', adminAuth)
        .send(websiteData);

      const response = await request(app)
        .post('/api/websites')
        .set('Authorization', adminAuth)
        .send({ ...websiteData, name: 'Second Website' });

      expect(response.status).toBe(409);
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .post('/api/websites')
        .send({ publishId: 'test', name: 'Test' });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/websites')
        .set('Authorization', adminAuth)
        .send({ name: 'No publish ID' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/websites', () => {
    beforeEach(async () => {
      await Website.create([
        { publishId: 'site-1', name: 'Site 1' },
        { publishId: 'site-2', name: 'Site 2' },
        { publishId: 'site-3', name: 'Site 3' },
      ]);
    });

    it('should return paginated websites', async () => {
      const response = await request(app)
        .get('/api/websites')
        .set('Authorization', adminAuth);

      expect(response.status).toBe(200);
      expect(response.body.websites).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/websites?page=1&limit=2')
        .set('Authorization', adminAuth);

      expect(response.status).toBe(200);
      expect(response.body.websites).toHaveLength(2);
      expect(response.body.pages).toBe(2);
    });
  });

  describe('GET /api/websites/validate/:publishId', () => {
    it('should return valid for active website', async () => {
      await Website.create({ publishId: 'active-site', name: 'Active' });

      const response = await request(app)
        .get('/api/websites/validate/active-site');

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.website).toBeDefined();
    });

    it('should return invalid for non-existent website', async () => {
      const response = await request(app)
        .get('/api/websites/validate/non-existent');

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(false);
    });

    it('should return invalid for inactive website', async () => {
      await Website.create({ publishId: 'inactive-site', name: 'Inactive', isActive: false });

      const response = await request(app)
        .get('/api/websites/validate/inactive-site');

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(false);
    });
  });

  describe('PUT /api/websites/:id', () => {
    it('should update website', async () => {
      const website = await Website.create({ publishId: 'update-test', name: 'Original' });

      const response = await request(app)
        .put(`/api/websites/${website._id}`)
        .set('Authorization', adminAuth)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/websites/:id', () => {
    it('should delete website', async () => {
      const website = await Website.create({ publishId: 'delete-test', name: 'To Delete' });

      const response = await request(app)
        .delete(`/api/websites/${website._id}`)
        .set('Authorization', adminAuth);

      expect(response.status).toBe(204);

      const found = await Website.findById(website._id);
      expect(found).toBeNull();
    });
  });
});
