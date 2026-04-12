const request = require('supertest');
const createApp = require('../app');
const { v4: uuidv4 } = require('uuid');

describe('Integration Tests: HTTP Endpoints', () => {
    let app, db;

    beforeAll(async () => {
        // Use in-memory SQLite database for testing
        const appInstance = createApp(':memory:');
        app = appInstance.app;
        db = appInstance.db;
    });

    afterAll((done) => {
        db.close(done);
    });

    describe('Health Check', () => {
        test('should return healthy status', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('healthy');
        });
    });

    describe('Save Endpoint', () => {
        test('should save valid text', async () => {
            const response = await request(app)
                .post('/save')
                .send({ content: 'Integration test content' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.message).toBe('Text saved successfully');
        });

        test('should reject empty text', async () => {
            const response = await request(app)
                .post('/save')
                .send({ content: '' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid text content');
        });

        test('should reject text exceeding maximum length', async () => {
            const longText = 'a'.repeat(100001);
            const response = await request(app)
                .post('/save')
                .send({ content: longText })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Text exceeds maximum length');
        });
    });

    describe('Load Endpoint', () => {
        test('should load valid text', async () => {
            const id = `text_${uuidv4()}`;
            const content = 'Integration test content';

            await new Promise((resolve) =>
                db.run(
                    `INSERT INTO saved_texts (id, content) VALUES (?, ?)`, 
                    [id, content], 
                    resolve
                )
            );

            const response = await request(app).get(`/load/${id}`);
            expect(response.status).toBe(200);
            expect(response.body.content).toBe(content);
        });

        test('should not load expired text', async () => {
            const id = `text_${uuidv4()}`;
            const content = 'Expired content';

            await new Promise((resolve) =>
                db.run(
                    `INSERT INTO saved_texts (id, content, expires_at) 
                     VALUES (?, ?, datetime('now', '-1 day'))`, 
                    [id, content], 
                    resolve
                )
            );

            const response = await request(app).get(`/load/${id}`);
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Text not found or expired');
        });

        test('should return 404 for non-existent ID', async () => {
            const response = await request(app).get('/load/non_existent_id');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Text not found or expired');
        });
    });
});