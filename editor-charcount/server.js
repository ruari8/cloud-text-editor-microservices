'use strict';

const express = require('express');

const PORT = 80;
const HOST = '0.0.0.0';

var charcount = require('./charcount');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "healthy"
    });
});


app.post('/', (req, res) => {
    try {
        const text = req.body.text;
        
        if (text === undefined || text === null) {
            return res.status(400).json({
                error: true,
                message: 'Text parameter is required'
            });
        }

        if (text.trim().length === 0) {
            return res.status(400).json({
                error: true,
                message: 'Text cannot be empty'
            });
        }

        const answer = charcount.counter(text);
        return res.status(200).json({
            error: false,
            string: `Contains ${answer} characters`,
            answer: answer
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

if (require.main === module) {
    app.listen(PORT, HOST);
    console.log(`Running on http://${HOST}:${PORT}`);
}

module.exports = app;