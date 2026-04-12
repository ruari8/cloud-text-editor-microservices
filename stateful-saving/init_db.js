const sqlite3 = require('sqlite3').verbose();

// Create or open the SQLite database file
const db = new sqlite3.Database('./text_storage.db');

// Initialize the table with just the essential fields
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS saved_texts (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME DEFAULT (datetime('now', '+7 days'))
        )
    `, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Database table initialized successfully.");
        }
    });
});

// Close the database connection
db.close();