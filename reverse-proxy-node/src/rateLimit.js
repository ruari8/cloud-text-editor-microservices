const { promisify } = require('util');

class RateLimiter {
    constructor() {
        // Store client requests with timestamps
        // Key: IP address, Value: Array of timestamps
        this.requests = new Map();
        
        // Global rate limit settings
        this.globalLimit = {
            windowMs: 10 * 60 * 100, // 10 minutes
            maxRequests: 200 // 20 requests per window
        };

        // Clean up old requests periodically
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    getClientIp(req) {
        return req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.connection.socket.remoteAddress;
    }

    cleanup() {
        const now = Date.now();
        for (const [ip, timestamps] of this.requests.entries()) {
            // Remove timestamps older than the window
            const oldestAllowed = now - this.globalLimit.windowMs;
            const validTimestamps = timestamps.filter(ts => ts > oldestAllowed);
            
            if (validTimestamps.length === 0) {
                this.requests.delete(ip);
            } else {
                this.requests.set(ip, validTimestamps);
            }
        }
    }

    getRateLimitInfo(clientIp) {
        const { windowMs, maxRequests } = this.globalLimit;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Get existing timestamps for this client
        const timestamps = this.requests.get(clientIp) || [];
        
        // Filter timestamps within current window
        const windowRequests = timestamps.filter(ts => ts > windowStart);
        
        // Calculate remaining requests
        const remaining = Math.max(0, maxRequests - windowRequests.length);
        
        // Calculate reset time
        const oldestTs = windowRequests[0] || now;
        const reset = Math.ceil((oldestTs + windowMs - now) / 1000);
        
        return {
            limit: maxRequests,
            remaining,
            reset,
            exceeded: remaining === 0
        };
    }

    middleware() {
        return (req, res, next) => {
            const clientIp = this.getClientIp(req);
            
            if (req.method === 'OPTIONS') {
                return next();
            }

            // Skip rate limiting for health checks and admin routes
            if (req.path.includes('/health') || req.path.startsWith('/admin')) {
                return next();
            }

            const rateLimitInfo = this.getRateLimitInfo(clientIp);
            
            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit);
            res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
            res.setHeader('X-RateLimit-Reset', rateLimitInfo.reset);
            
            if (rateLimitInfo.exceeded) {
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded. Try again in ${rateLimitInfo.reset} seconds`
                });
            }
            
            // Store this request timestamp
            const timestamps = this.requests.get(clientIp) || [];
            timestamps.push(Date.now());
            this.requests.set(clientIp, timestamps);
            
            next();
        };
    }
}

module.exports = RateLimiter;