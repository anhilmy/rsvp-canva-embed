import request from 'supertest';
import app from '../app';
import { Website, Guest } from '../models';

const adminAuth = 'Bearer test-admin-password';

describe('Guest API', () => {
    let website: InstanceType<typeof Website>;

    beforeEach(async () => {
        website = await Website.create({
            publishId: 'test-website',
            name: 'Test Wedding',
        });
    });

    describe('POST /api/guests/:websiteId', () => {
        it('should create a guest with unique code', async () => {
            const response = await request(app)
                .post(`/api/guests/${website._id}`)
                .set('Authorization', adminAuth)
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    maxAttendees: 2,
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('John Doe');
            expect(response.body.uniqueCode).toHaveLength(6);
            expect(response.body.maxAttendees).toBe(2);
        });

        it('should return 404 for non-existent website', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .post(`/api/guests/${fakeId}`)
                .set('Authorization', adminAuth)
                .send({ name: 'Test Guest' });

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/guests/:websiteId/bulk', () => {
        it('should create multiple guests', async () => {
            const response = await request(app)
                .post(`/api/guests/${website._id}/bulk`)
                .set('Authorization', adminAuth)
                .send({
                    guests: [
                        { name: 'Guest 1', maxAttendees: 1 },
                        { name: 'Guest 2', maxAttendees: 2 },
                        { name: 'Guest 3', maxAttendees: 3 },
                    ],
                });

            expect(response.status).toBe(201);
            expect(response.body.guests).toHaveLength(3);
            expect(response.body.count).toBe(3);

            // Ensure all codes are unique
            const codes = response.body.guests.map((g: { uniqueCode: string }) => g.uniqueCode);
            const uniqueCodes = new Set(codes);
            expect(uniqueCodes.size).toBe(3);
        });
    });

    describe('POST /api/guests/validate', () => {
        it('should validate correct guest code', async () => {
            const guest = await Guest.create({
                websiteId: website._id,
                name: 'Valid Guest',
                uniqueCode: 'ABC123',
                maxAttendees: 2,
            });

            const response = await request(app)
                .post('/api/guests/validate')
                .send({
                    code: 'ABC123',
                    publishId: 'test-website',
                });

            expect(response.status).toBe(200);
            expect(response.body.valid).toBe(true);
            expect(response.body.guest.name).toBe('Valid Guest');
            expect(response.body.guest.maxAttendees).toBe(2);
        });

        it('should be case-insensitive for code', async () => {
            await Guest.create({
                websiteId: website._id,
                name: 'Case Test Guest',
                uniqueCode: 'XYZ789',
                maxAttendees: 1,
            });

            const response = await request(app)
                .post('/api/guests/validate')
                .send({
                    code: 'xyz789', // lowercase
                    publishId: 'test-website',
                });

            expect(response.status).toBe(200);
            expect(response.body.valid).toBe(true);
        });

        it('should reject invalid code', async () => {
            const response = await request(app)
                .post('/api/guests/validate')
                .send({
                    code: 'INVALID',
                    publishId: 'test-website',
                });

            expect(response.status).toBe(400);
            expect(response.body.valid).toBe(false);
        });

        it('should reject guest for wrong website', async () => {
            const otherWebsite = await Website.create({
                publishId: 'other-website',
                name: 'Other Wedding',
            });

            await Guest.create({
                websiteId: otherWebsite._id,
                name: 'Other Guest',
                uniqueCode: 'OTHER1',
                maxAttendees: 1,
            });

            const response = await request(app)
                .post('/api/guests/validate')
                .send({
                    code: 'OTHER1',
                    publishId: 'test-website', // Wrong website
                });

            expect(response.status).toBe(400);
            expect(response.body.valid).toBe(false);
        });
    });

    describe('GET /api/guests/website/:websiteId', () => {
        it('should return guests for website', async () => {
            await Guest.create([
                { websiteId: website._id, name: 'Guest 1', uniqueCode: 'CODE01', maxAttendees: 1 },
                { websiteId: website._id, name: 'Guest 2', uniqueCode: 'CODE02', maxAttendees: 2 },
            ]);

            const response = await request(app)
                .get(`/api/guests/website/${website._id}`)
                .set('Authorization', adminAuth);

            expect(response.status).toBe(200);
            expect(response.body.guests).toHaveLength(2);
            expect(response.body.total).toBe(2);
        });
    });
});
