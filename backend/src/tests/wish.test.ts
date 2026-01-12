import request from 'supertest';
import app from '../app';
import { Website, Guest, Wish } from '../models';

const adminAuth = 'Bearer test-admin-password';

describe('Wish API', () => {
    let website: InstanceType<typeof Website>;
    let guest: InstanceType<typeof Guest>;

    beforeEach(async () => {
        website = await Website.create({
            publishId: 'wish-test-website',
            name: 'Wish Test Wedding',
        });

        guest = await Guest.create({
            websiteId: website._id,
            name: 'Wishing Guest',
            uniqueCode: 'WISH01',
            maxAttendees: 1,
        });
    });

    describe('POST /api/wishes', () => {
        it('should create a wish for valid guest', async () => {
            const response = await request(app)
                .post('/api/wishes')
                .send({
                    guestCode: 'WISH01',
                    publishId: 'wish-test-website',
                    message: 'Congratulations on your wedding!',
                });

            expect(response.status).toBe(201);
            expect(response.body.guestName).toBe('Wishing Guest');
            expect(response.body.message).toBe('Congratulations on your wedding!');
        });

        it('should reject after max wishes per guest', async () => {
            // Create 3 wishes (max)
            for (let i = 0; i < 3; i++) {
                await Wish.create({
                    guestId: guest._id,
                    websiteId: website._id,
                    guestName: guest.name,
                    message: `Wish ${i + 1}`,
                });
            }

            const response = await request(app)
                .post('/api/wishes')
                .send({
                    guestCode: 'WISH01',
                    publishId: 'wish-test-website',
                    message: 'Fourth wish - should fail',
                });

            expect(response.status).toBe(429);
        });

        it('should reject invalid guest code', async () => {
            const response = await request(app)
                .post('/api/wishes')
                .send({
                    guestCode: 'INVALID',
                    publishId: 'wish-test-website',
                    message: 'Some message',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/wishes/public/:publishId', () => {
        beforeEach(async () => {
            await Wish.create([
                { guestId: guest._id, websiteId: website._id, guestName: 'Guest 1', message: 'Visible 1', isApproved: true, isHidden: false },
                { guestId: guest._id, websiteId: website._id, guestName: 'Guest 2', message: 'Visible 2', isApproved: true, isHidden: false },
                { guestId: guest._id, websiteId: website._id, guestName: 'Guest 3', message: 'Hidden', isApproved: true, isHidden: true },
                { guestId: guest._id, websiteId: website._id, guestName: 'Guest 4', message: 'Not approved', isApproved: false, isHidden: false },
            ]);
        });

        it('should return only visible and approved wishes', async () => {
            const response = await request(app)
                .get('/api/wishes/public/wish-test-website');

            expect(response.status).toBe(200);
            expect(response.body.wishes).toHaveLength(2);
            expect(response.body.wishes.every((w: { message: string }) =>
                w.message.startsWith('Visible')
            )).toBe(true);
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/wishes/public/wish-test-website?page=1&limit=1');

            expect(response.status).toBe(200);
            expect(response.body.wishes).toHaveLength(1);
            expect(response.body.total).toBe(2);
            expect(response.body.pages).toBe(2);
        });
    });

    describe('GET /api/wishes/my/:code', () => {
        it('should return wishes for specific guest', async () => {
            await Wish.create([
                { guestId: guest._id, websiteId: website._id, guestName: guest.name, message: 'My wish 1' },
                { guestId: guest._id, websiteId: website._id, guestName: guest.name, message: 'My wish 2' },
            ]);

            const response = await request(app)
                .get('/api/wishes/my/WISH01');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });
    });

    describe('POST /api/wishes/:id/toggle-visibility', () => {
        it('should toggle wish visibility', async () => {
            const wish = await Wish.create({
                guestId: guest._id,
                websiteId: website._id,
                guestName: guest.name,
                message: 'Toggle test',
                isHidden: false,
            });

            const response = await request(app)
                .post(`/api/wishes/${wish._id}/toggle-visibility`)
                .set('Authorization', adminAuth);

            expect(response.status).toBe(200);
            expect(response.body.isHidden).toBe(true);

            // Toggle again
            const response2 = await request(app)
                .post(`/api/wishes/${wish._id}/toggle-visibility`)
                .set('Authorization', adminAuth);

            expect(response2.body.isHidden).toBe(false);
        });
    });

    describe('POST /api/wishes/:id/toggle-approval', () => {
        it('should toggle wish approval', async () => {
            const wish = await Wish.create({
                guestId: guest._id,
                websiteId: website._id,
                guestName: guest.name,
                message: 'Approval test',
                isApproved: true,
            });

            const response = await request(app)
                .post(`/api/wishes/${wish._id}/toggle-approval`)
                .set('Authorization', adminAuth);

            expect(response.status).toBe(200);
            expect(response.body.isApproved).toBe(false);
        });
    });

    describe('DELETE /api/wishes/:id', () => {
        it('should delete wish', async () => {
            const wish = await Wish.create({
                guestId: guest._id,
                websiteId: website._id,
                guestName: guest.name,
                message: 'Delete me',
            });

            const response = await request(app)
                .delete(`/api/wishes/${wish._id}`)
                .set('Authorization', adminAuth);

            expect(response.status).toBe(204);

            const found = await Wish.findById(wish._id);
            expect(found).toBeNull();
        });
    });
});
