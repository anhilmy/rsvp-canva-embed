import request from 'supertest';
import app from '../app';
import { Website, Guest, RSVP } from '../models';

const adminAuth = 'Bearer test-admin-password';

describe('RSVP API', () => {
    let website: InstanceType<typeof Website>;
    let guest: InstanceType<typeof Guest>;

    beforeEach(async () => {
        website = await Website.create({
            publishId: 'rsvp-test-website',
            name: 'RSVP Test Wedding',
        });

        guest = await Guest.create({
            websiteId: website._id,
            name: 'Test Guest',
            uniqueCode: 'RSVP01',
            maxAttendees: 3,
        });
    });

    describe('POST /api/rsvp', () => {
        it('should create RSVP for valid guest', async () => {
            const response = await request(app)
                .post('/api/rsvp')
                .send({
                    guestCode: 'RSVP01',
                    publishId: 'rsvp-test-website',
                    status: 'attending',
                    attendeeCount: 2,
                    dietaryRestrictions: 'Vegetarian',
                });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('attending');
            expect(response.body.attendeeCount).toBe(2);
        });

        it('should reject duplicate RSVP', async () => {
            await request(app)
                .post('/api/rsvp')
                .send({
                    guestCode: 'RSVP01',
                    publishId: 'rsvp-test-website',
                    status: 'attending',
                    attendeeCount: 1,
                });

            const response = await request(app)
                .post('/api/rsvp')
                .send({
                    guestCode: 'RSVP01',
                    publishId: 'rsvp-test-website',
                    status: 'not_attending',
                    attendeeCount: 0,
                });

            expect(response.status).toBe(409);
        });

        it('should reject attendee count exceeding max', async () => {
            const response = await request(app)
                .post('/api/rsvp')
                .send({
                    guestCode: 'RSVP01',
                    publishId: 'rsvp-test-website',
                    status: 'attending',
                    attendeeCount: 5, // Max is 3
                });

            expect(response.status).toBe(400);
        });

        it('should set attendeeCount to 0 for not_attending', async () => {
            const response = await request(app)
                .post('/api/rsvp')
                .send({
                    guestCode: 'RSVP01',
                    publishId: 'rsvp-test-website',
                    status: 'not_attending',
                    attendeeCount: 2, // Should be ignored
                });

            expect(response.status).toBe(201);
            expect(response.body.attendeeCount).toBe(0);
        });
    });

    describe('GET /api/rsvp/check/:code', () => {
        it('should return hasRSVP false for new guest', async () => {
            const response = await request(app)
                .get('/api/rsvp/check/RSVP01');

            expect(response.status).toBe(200);
            expect(response.body.hasRSVP).toBe(false);
        });

        it('should return RSVP details for existing RSVP', async () => {
            await RSVP.create({
                guestId: guest._id,
                websiteId: website._id,
                status: 'attending',
                attendeeCount: 2,
            });

            const response = await request(app)
                .get('/api/rsvp/check/RSVP01');

            expect(response.status).toBe(200);
            expect(response.body.hasRSVP).toBe(true);
            expect(response.body.rsvp.status).toBe('attending');
            expect(response.body.rsvp.attendeeCount).toBe(2);
        });
    });

    describe('PUT /api/rsvp/:code', () => {
        beforeEach(async () => {
            await RSVP.create({
                guestId: guest._id,
                websiteId: website._id,
                status: 'attending',
                attendeeCount: 2,
            });
        });

        it('should update existing RSVP', async () => {
            const response = await request(app)
                .put('/api/rsvp/RSVP01')
                .send({
                    status: 'not_attending',
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('not_attending');
        });
    });

    describe('GET /api/rsvp/website/:websiteId', () => {
        beforeEach(async () => {
            const guest2 = await Guest.create({
                websiteId: website._id,
                name: 'Guest 2',
                uniqueCode: 'RSVP02',
                maxAttendees: 2,
            });

            await RSVP.create([
                { guestId: guest._id, websiteId: website._id, status: 'attending', attendeeCount: 2 },
                { guestId: guest2._id, websiteId: website._id, status: 'not_attending', attendeeCount: 0 },
            ]);
        });

        it('should return RSVPs with stats', async () => {
            const response = await request(app)
                .get(`/api/rsvp/website/${website._id}`)
                .set('Authorization', adminAuth);

            expect(response.status).toBe(200);
            expect(response.body.rsvps).toHaveLength(2);
            expect(response.body.stats.attending).toBe(1);
            expect(response.body.stats.notAttending).toBe(1);
            expect(response.body.stats.totalAttendees).toBe(2);
        });
    });

    describe('GET /api/rsvp/status/:websiteId', () => {
        it('should return guest RSVP status', async () => {
            const guest2 = await Guest.create({
                websiteId: website._id,
                name: 'No RSVP Guest',
                uniqueCode: 'NORSVP',
                maxAttendees: 1,
            });

            await RSVP.create({
                guestId: guest._id,
                websiteId: website._id,
                status: 'attending',
                attendeeCount: 2,
            });

            const response = await request(app)
                .get(`/api/rsvp/status/${website._id}`)
                .set('Authorization', adminAuth);

            expect(response.status).toBe(200);
            expect(response.body.guests).toHaveLength(2);

            const withRSVP = response.body.guests.find((g: { code: string }) => g.code === 'RSVP01');
            const withoutRSVP = response.body.guests.find((g: { code: string }) => g.code === 'NORSVP');

            expect(withRSVP.hasRSVP).toBe(true);
            expect(withRSVP.status).toBe('attending');
            expect(withoutRSVP.hasRSVP).toBe(false);
        });
    });
});
