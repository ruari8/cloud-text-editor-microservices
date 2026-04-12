const crypto = require('crypto');

class CacheManager {
    constructor(options = {}) {
        this.cache = new Map();
        this.defaultTTL = options.ttl || 60 * 1000; // Default 60 seconds
        this.maxCacheSize = options.maxSize || 100; // Maximum number of cached items
        
        // Clean up expired cache entries periodically
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    generateCacheKey(req) {
        // Create unique key based on path and request body
        const data = `${req.path}:${JSON.stringify(req.body)}`;
        return crypto.createHash('md5').update(data).digest('hex');
    }

    shouldCache(req) {
        // Only cache POST requests to our service endpoints
        if (req.method !== 'POST') return false;
        
        // Don't cache admin routes
        if (req.path.startsWith('/admin') || req.path.includes('/health')) {
            return false;
        }

        // Don't cache empty bodies
        if (!req.body || !req.body.text) {
            return false;
        }

        return true;
    }

    cleanup() {
        const now = Date.now();
        for (const [key, data] of this.cache.entries()) {
            if (now >= data.expiresAt) {
                this.cache.delete(key);
            }
        }

        console.log(`[Cache] Current cache size: ${this.cache.size} entries`);
    }

    get(key) {
        const data = this.cache.get(key);
        if (!data) return null;

        // Check if cached data has expired
        if (Date.now() >= data.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return data;
    }

    set(key, value, ttl = this.defaultTTL) {
        // Enforce cache size limit
        if (this.cache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            data: value,
            expiresAt: Date.now() + ttl,
            cachedAt: Date.now()
        });
    }

    invalidateAll() {
        this.cache.clear();
        console.log('[Cache] Cache invalidated');
    }

    middleware() {
        return (req, res, next) => {
            if (!this.shouldCache(req)) {
                return next();
            }

            const cacheKey = this.generateCacheKey(req);
            const cachedResponse = this.get(cacheKey);

            if (cachedResponse) {
                console.log(`[Cache] HIT for ${req.path}`);
                // Add cache headers
                const age = Math.floor((Date.now() - cachedResponse.cachedAt) / 1000);
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('Age', age);
                
                // Return cached response
                return res.status(200).json(cachedResponse.data);
            }

            console.log(`[Cache] MISS for ${req.path}`);
            res.setHeader('X-Cache', 'MISS');

            // Intercept the response
            const originalWrite = res.write;
            const originalEnd = res.end;
            const chunks = [];

            res.write = function (chunk) {
                chunks.push(chunk);
                originalWrite.apply(res, arguments);
            };

            res.end = function (chunk) {
                if (chunk) {
                    chunks.push(chunk);
                }

                const body = Buffer.concat(chunks).toString('utf8');

                if (res.statusCode === 200) {
                    try {
                        const responseData = JSON.parse(body);
                        this.set(cacheKey, responseData);
                        console.log(`[Cache] Cached response for ${req.path}`);
                    } catch (e) {
                        console.error('[Cache] Failed to parse response for caching:', e);
                    }
                }

                originalEnd.apply(res, arguments);
            }.bind(this);

            next();
        };
    }
}

module.exports = CacheManager;