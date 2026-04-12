const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

function createApp(dbPath = './text_storage.db') {
    const app = express();
    const PORT = 4000;

    // Middleware
    app.use(express.json());
    app.use(cors());

    // Create database connection
    const db = new sqlite3.Database(dbPath);

    // Initialize database
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS saved_texts (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME DEFAULT (datetime('now', '+7 days'))
            )
        `);
    });

    // Text validation with size limits
    const MAX_TEXT_LENGTH = 100000;

    const validateText = (text) => {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text content');
        }
        
        const trimmed = text.trim();
        
        if (trimmed.length === 0) {
            throw new Error('Invalid text content');
        }
        
        if (trimmed.length > MAX_TEXT_LENGTH) {
            throw new Error('Text exceeds maximum length');
        }
        
        return trimmed;
    };

    // Health check endpoint
    app.get('/health', (req, res) => {
        db.get('SELECT 1', (err) => {
            if (err) {
                res.status(500).json({ 
                    status: 'unhealthy', 
                    error: 'Database connection failed' 
                });
            } else {
                res.json({ status: 'healthy' });
            }
        });
    });

    // Save text endpoint
    app.post('/save', (req, res) => {
        try {
            const { content } = req.body;
            const validatedText = validateText(content);
            const id = `text_${uuidv4()}`;

            db.run(
                `INSERT INTO saved_texts (id, content) VALUES (?, ?)`,
                [id, validatedText],
                (err) => {
                    if (err) {
                        console.error('Save error:', err);
                        return res.status(500).json({ 
                            error: 'Failed to save text' 
                        });
                    }
                    res.status(201).json({ 
                        id, 
                        message: 'Text saved successfully'
                    });
                }
            );
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Load text endpoint
    app.get('/load/:id', (req, res) => {
        const { id } = req.params;

        db.get(
            `SELECT content FROM saved_texts 
             WHERE id = ? AND expires_at > datetime('now')`,
            [id],
            (err, row) => {
                if (err) {
                    console.error('Load error:', err);
                    return res.status(500).json({ 
                        error: 'Failed to load text' 
                    });
                }
                if (!row) {
                    return res.status(404).json({ 
                        error: 'Text not found or expired' 
                    });
                }
                res.json({ content: row.content });
            }
        );
    });

    // Cleanup expired texts (runs every 24 hours)
    setInterval(() => {
        db.run(
            `DELETE FROM saved_texts WHERE expires_at <= datetime('now')`,
            [],
            (err) => {
                if (err) {
                    console.error('Cleanup error:', err);
                } else {
                    console.log('Expired texts cleaned up');
                }
            }
        );
    }, 24 * 60 * 60 * 1000);

    // Database error handling
    db.on('error', (err) => {
        console.error('Database error:', err);
    });

    return { app, db };
}

// For normal usage
if (require.main === module) {
    const dbPath = process.env.DB_PATH || './text_storage.db';
    const { app } = createApp(dbPath);
    app.listen(4000, () => {
        console.log(`Server is running on http://localhost:4000`);
    });
}

module.exports = createApp;