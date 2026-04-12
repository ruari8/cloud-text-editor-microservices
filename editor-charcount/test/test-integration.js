const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');

describe('Character Counter API Integration Tests', () => {
    describe('POST / endpoint', () => {
        it('should count characters for valid input', async () => {
            const response = await request(app)
                .post('/')
                .send({ text: 'hello world' })
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.error).to.be.false;
            expect(response.body.answer).to.equal(11);
            expect(response.body.string).to.equal('Contains 11 characters');
        });

        it('should handle missing text parameter', async () => {
            const response = await request(app)
                .post('/')
                .send({})  // Empty body
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error).to.be.true;
            expect(response.body.message).to.equal('Text parameter is required');
        });

        it('should handle empty text parameter', async () => {
            const response = await request(app)
                .post('/')
                .send({ text: '' })
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error).to.be.true;
            expect(response.body.message).to.equal('Text cannot be empty');
        });

        it('should handle text with only whitespace', async () => {
            const response = await request(app)
                .post('/')
                .send({ text: '   ' })
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error).to.be.true;
            expect(response.body.message).to.equal('Text cannot be empty');
        });
    });

    describe('CORS support', () => {
        it('should have CORS headers', async () => {
            const response = await request(app)
                .post('/')
                .send({ text: 'test' });

            expect(response.headers['access-control-allow-origin']).to.equal('*');
            expect(response.headers['access-control-allow-methods']).to.contains('POST');
            expect(response.headers['access-control-allow-headers']).to.contains('Content-Type');
        });

        it('should handle OPTIONS request', async () => {
            const response = await request(app)
                .options('/')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).to.equal('*');
            expect(response.headers['access-control-allow-methods']).to.contains('POST');
            expect(response.headers['access-control-allow-headers']).to.contains('Content-Type');
        });
    });

    describe('Health Check', () => {
        it('should return healthy status', async () => {
            const response = await request(app)
                .get('/health')
                .expect('Content-Type', /json/)
                .expect(200);
    
            expect(response.body.status).to.equal("healthy");
        });
    });
});