const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

describe('Unit Tests: Database Operations', () => {
    let db;

    beforeAll((done) => {
        db = new sqlite3.Database(':memory:');
        db.run(`
            CREATE TABLE IF NOT EXISTS saved_texts (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME DEFAULT (datetime('now', '+7 days'))
            )
        `, done);
    });

    afterAll((done) => {
        db.close(done);
    });

    describe('Save Operations', () => {
        test('should save text with expiration', (done) => {
            const id = `text_${uuidv4()}`;
            const content = 'Unit test content';

            db.run(
                `INSERT INTO saved_texts (id, content) VALUES (?, ?)`,
                [id, content],
                function (err) {
                    expect(err).toBeNull();
                    expect(this.changes).toBe(1);
                    done();
                }
            );
        });
    });

    describe('Load Operations', () => {
        beforeEach((done) => {
            db.run('DELETE FROM saved_texts', done);
        });

        test('should load non-expired text', (done) => {
            const id = 'text_unit_test';
            const content = 'Content for unit test';

            db.run(
                `INSERT INTO saved_texts (id, content) VALUES (?, ?)`,
                [id, content],
                (err) => {
                    expect(err).toBeNull();
                    db.get(
                        `SELECT content FROM saved_texts WHERE id = ?`,
                        [id],
                        (err, row) => {
                            expect(err).toBeNull();
                            expect(row.content).toBe(content);
                            done();
                        }
                    );
                }
            );
        });

        test('should not load expired text', (done) => {
            const id = 'text_expired';
            const content = 'Expired content';

            db.run(
                `INSERT INTO saved_texts (id, content, expires_at) 
                 VALUES (?, ?, datetime('now', '-1 day'))`,
                [id, content],
                (err) => {
                    expect(err).toBeNull();
                    db.get(
                        `SELECT content FROM saved_texts 
                         WHERE id = ? AND expires_at > datetime('now')`,
                        [id],
                        (err, row) => {
                            expect(err).toBeNull();
                            expect(row).toBeUndefined();
                            done();
                        }
                    );
                }
            );
        });
    });

    describe('Cleanup Operations', () => {
        beforeEach((done) => {
            db.run('DELETE FROM saved_texts', done);
        });

        test('should delete expired texts', (done) => {
            const id = 'text_to_cleanup';
            const content = 'Content to cleanup';

            db.run(
                `INSERT INTO saved_texts (id, content, expires_at) 
                 VALUES (?, ?, datetime('now', '-1 day'))`,
                [id, content],
                (err) => {
                    expect(err).toBeNull();
                    db.run(
                        `DELETE FROM saved_texts WHERE expires_at <= datetime('now')`,
                        function(err) {
                            expect(err).toBeNull();
                            expect(this.changes).toBeGreaterThan(0);
                            done();
                        }
                    );
                }
            );
        });
    });
});