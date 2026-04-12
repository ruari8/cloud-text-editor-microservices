const express = require("express");
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");
const RateLimiter = require('./rateLimit');
const CacheManager = require('./cache');
const cache = new CacheManager({
    ttl: 60 * 1000,
    maxSize: 100
});

const app = express();
const PORT = 3000;

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_FAILURES = 3;
let serviceHealth = {};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Middleware to parse application/x-www-form-urlencoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

const rateLimiter = new RateLimiter();
app.use(rateLimiter.middleware());
app.use(cache.middleware());

// Load routes configuration from file
const routesFile = "./routes.json";
let routes = JSON.parse(fs.readFileSync(routesFile));

// Function to dynamically reload routes
function reloadRoutes() {
    routes = JSON.parse(fs.readFileSync(routesFile));
    console.log("[Proxy] Routes reloaded:", routes);
}

// Helper function to save routes
function saveRoutes() {
    fs.writeFileSync(routesFile, JSON.stringify(routes, null, 2));
    reloadRoutes();
    cache.invalidateAll();
}

// Health check function
async function checkServiceHealth(path, target) {
    try {
        const url = new URL(target);
        const healthPath = path.startsWith('/FindReplace') ? '/FindReplace/health' : '/health';
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: healthPath,
            method: 'GET',
            timeout: 5000  // 5 second timeout for health checks
        };

        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', chunk => { data += chunk; });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        resolve(response?.status === 'healthy');
                    } catch (e) {
                        resolve(false);
                    }
                });
            });

            req.on('error', () => resolve(false));
            req.end();
        });
    } catch (error) {
        return false;
    }
}

// Health check runner
async function runHealthChecks() {
    console.log('[Proxy] Running health checks...');
    
    for (const [path, target] of Object.entries(routes)) {
        const isHealthy = await checkServiceHealth(path, target);
        
        // Initialize health tracking if needed
        if (!serviceHealth[path]) {
            serviceHealth[path] = { failures: 0 };
        }

        if (isHealthy) {
            // Reset failures on successful health check
            if (serviceHealth[path].failures > 0) {
                console.log(`[Proxy] Service ${path} recovered after ${serviceHealth[path].failures} failures`);
            }
            serviceHealth[path].failures = 0;
        } else {
            // Increment failures and check if service should be removed
            serviceHealth[path].failures++;
            console.log(`[Proxy] Service ${path} health check failed (${serviceHealth[path].failures}/${MAX_FAILURES})`);
            
            if (serviceHealth[path].failures >= MAX_FAILURES) {
                console.log(`[Proxy] Service ${path} exceeded maximum failures - removing from routes`);
                delete routes[path];
                delete serviceHealth[path];
                saveRoutes();
            }
        }
    }
}

// Endpoint for dynamic route updates
app.post("/admin/add", (req, res) => {
    const { path, target } = req.body;

    if (!path || !target) {
        return res.status(400).json({ error: "Path and target are required." });
    }

    if (routes[path]) {
        return res.status(409).json({ error: "Route already exists. Use /admin/update to modify it." });
    }

    routes[path] = target;
    saveRoutes();
    res.json({ success: true, message: `Route ${path} added successfully.` });
});

// Update an existing route
app.put("/admin/update", (req, res) => {
    const { path, target } = req.body;

    if (!path || !target) {
        return res.status(400).json({ error: "Path and target are required." });
    }

    if (!routes[path]) {
        return res.status(404).json({ error: "Route does not exist. Use /admin/add to create it." });
    }

    routes[path] = target;
    saveRoutes();
    res.json({ success: true, message: `Route ${path} updated successfully.` });
});

// Delete a route
app.delete("/admin/delete", (req, res) => {
    const { path } = req.body;

    if (!path) {
        return res.status(400).json({ error: "Path is required." });
    }

    if (!routes[path]) {
        return res.status(404).json({ error: "Route does not exist." });
    }

    delete routes[path];
    saveRoutes();
    res.json({ success: true, message: `Route ${path} deleted successfully.` });
});

// List all routes
app.get("/admin/list", (req, res) => {
    res.json({ availableRoutes: routes });
});

app.post("/register", async (req, res) => {
    const { path, target } = req.body;

    if (!path || !target) {
        return res.status(400).json({ error: "Path and target are required." });
    }

    // Validate path format
    if (!path.startsWith('/')) {
        return res.status(400).json({ error: "Path must start with /" });
    }

    // Validate target URL
    try {
        new URL(target);
    } catch (e) {
        return res.status(400).json({ error: "Invalid target URL format" });
    }

    // Check if route already exists
    if (routes[path]) {
        return res.status(409).json({ error: "Route already exists. Use /admin/update to modify it." });
    }

    // Add the new route
    routes[path] = target;
    saveRoutes();
    
    console.log(`[Proxy] Service registered - Path: ${path}, Target: ${target}`);
    res.status(201).json({ 
        success: true, 
        message: `Service registered successfully for path: ${path}`
    });
});

// Generic proxy handler
app.use((req, res) => {
    const routePath = Object.keys(routes).find(path => req.path.startsWith(path));
    if (!routePath) {
        return res.status(404).json({ error: "Route not found" });
    }

    let hasResponded = false;

    const target = routes[routePath];
    const targetUrl = new URL(target);
    
    const remainingPath = req.path.slice(routePath.length);
    
    const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || 80,
        path: targetUrl.pathname + remainingPath,
        method: req.method,
        headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
        if (hasResponded) return;
        hasResponded = true;
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", (err) => {
        if (hasResponded) return;
        hasResponded = true;
        console.error("[Proxy] Proxy error:", err);
        res.status(500).json({ error: "Proxy error occurred" });
    });

    proxyReq.setTimeout(10000, () => {
        if (hasResponded) return;
        hasResponded = true;
        console.error("[Proxy] Request timed out.");
        res.status(504).json({ error: "Request timed out" });
        proxyReq.abort();
    });

    if (req.headers["content-type"] === "application/json" && req.body) {
        const bodyData = JSON.stringify(req.body);
        console.log("[Proxy] Forwarding JSON body:", bodyData);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    } else if (req.headers["content-type"] === "application/x-www-form-urlencoded" && req.body) {
        const formEncodedData = new URLSearchParams(req.body).toString();
        console.log("[Proxy] Forwarding form-encoded body:", formEncodedData);
        proxyReq.write(formEncodedData);
    }

    proxyReq.end();
});

// Start the health check interval
const healthCheckInterval = setInterval(runHealthChecks, HEALTH_CHECK_INTERVAL);

// Add cleanup on server shutdown
process.on('SIGINT', () => {
    clearInterval(healthCheckInterval);
    process.exit();
});

app.listen(PORT, () => {
    console.log(`[Proxy] Reverse proxy running on http://localhost:${PORT}`);
});
