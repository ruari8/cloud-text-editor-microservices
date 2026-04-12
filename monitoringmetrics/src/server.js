require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const config = require('./config');
const { checkAllServices, checkService, getHealthStatus } = require('./monitor');
const AlertManager = require('./alerts');
const alerts = new AlertManager();

const app = express();
app.use(express.json());

// Track last check time and any ongoing checks
let lastCheckTime = null;
let checkInProgress = false;

// Function to run checks with protection against overlapping
async function runServiceChecks() {
    if (checkInProgress) {
        console.log('Previous check still in progress, skipping...');
        return;
    }

    try {
        checkInProgress = true;
        const startTime = Date.now();
        
        const results = await checkAllServices();
        lastCheckTime = new Date().toISOString();
        const duration = Date.now() - startTime;
        
        // Prepare summary statistics
        const serviceStats = {
            total: 0,
            healthy: 0,
            failing: 0,
            avgResponseTime: 0
        };

        // Calculate summary statistics
        Object.entries(results).forEach(([mode, services]) => {
            Object.entries(services).forEach(([service, result]) => {
                serviceStats.total++;
                if (result.status === 'healthy') {
                    serviceStats.healthy++;
                } else {
                    serviceStats.failing++;
                }
                serviceStats.avgResponseTime += result.responseTime;
            });
        });

        serviceStats.avgResponseTime = (serviceStats.avgResponseTime / serviceStats.total).toFixed(2);

        // Only send alerts for issues
        if (serviceStats.failing > 0) {
            await alerts.sendAlert(
                `Issues detected in monitoring check:\n` +
                `Duration: ${duration}ms\n` +
                `Services: ${serviceStats.healthy}/${serviceStats.total} healthy\n` +
                `Average Response Time: ${serviceStats.avgResponseTime}ms`,
                'warning'
            );
        }

        // Log completion for debugging without sending alert
        console.log(`Monitoring check completed:
            Duration: ${duration}ms
            Services: ${serviceStats.healthy}/${serviceStats.total} healthy
            Average Response Time: ${serviceStats.avgResponseTime}ms`);

    } catch (error) {
        console.error('Error during service checks:', error);
        await alerts.sendAlert(
            `Error during monitoring check: ${error.message}`,
            'critical'
        );
    } finally {
        checkInProgress = false;
    }
}

// Schedule periodic checks
cron.schedule(config.monitoring.checkInterval, runServiceChecks);

// Health endpoint now includes more detailed status
app.get('/health', async (req, res) => {
    const currentStatus = getHealthStatus();
    const healthStatus = {
        status: 'healthy',
        lastCheck: lastCheckTime,
        checkInProgress,
        services: {
            direct: {},
            proxy: {}
        }
    };

    // Calculate overall health
    let hasFailingServices = false;
    Object.entries(currentStatus).forEach(([mode, services]) => {
        Object.entries(services).forEach(([service, status]) => {
            healthStatus.services[mode][service] = {
                status: status.status,
                lastChecked: status.timestamp,
                responseTime: status.responseTime
            };
            if (status.status === 'failing') {
                hasFailingServices = true;
            }
        });
    });

    if (hasFailingServices) {
        healthStatus.status = 'degraded';
    }

    res.json(healthStatus);
});

// Manual check endpoint now includes more detailed response
app.post('/check', async (req, res) => {
    if (checkInProgress) {
        return res.status(429).json({ 
            error: 'Check already in progress',
            lastCheck: lastCheckTime
        });
    }

    try {
        const startTime = Date.now();
        const results = await checkAllServices();
        lastCheckTime = new Date().toISOString();
        const duration = Date.now() - startTime;

        // Calculate summary statistics
        const summary = {
            timestamp: lastCheckTime,
            duration: duration,
            services: {
                total: 0,
                healthy: 0,
                failing: 0
            },
            results
        };

        Object.entries(results).forEach(([mode, services]) => {
            Object.entries(services).forEach(([service, result]) => {
                summary.services.total++;
                if (result.status === 'healthy') {
                    summary.services.healthy++;
                } else {
                    summary.services.failing++;
                }
            });
        });

        // Only alert on failures for manual checks
        if (summary.services.failing > 0) {
            await alerts.sendAlert(
                `Manual check detected issues:\n` +
                `Services: ${summary.services.healthy}/${summary.services.total} healthy`,
                'warning'
            );
        }

        res.json(summary);
    } catch (error) {
        console.error('Error during manual check:', error);
        await alerts.sendAlert(
            `Error during manual check: ${error.message}`,
            'critical'
        );
        res.status(500).json({ 
            error: 'Failed to complete service checks',
            message: error.message
        });
    }
});

// Service-specific check endpoint with enhanced response
app.post('/check/:service', async (req, res) => {
    const { service } = req.params;
    const { mode = 'both' } = req.body;

    try {
        if (!config.direct[service]) {
            return res.status(404).json({ error: 'Service not found' });
        }

        await alerts.sendAlert(
            `Starting check for service: ${service} (mode: ${mode})`,
            'info'
        );

        let results = {};
        if (mode === 'both' || mode === 'direct') {
            results.direct = await checkService(service, 'direct');
        }
        if (mode === 'both' || mode === 'proxy') {
            results.proxy = await checkService(service, 'proxy');
        }

        res.json({
            timestamp: new Date().toISOString(),
            service,
            mode,
            results
        });
    } catch (error) {
        await alerts.sendAlert(
            `Failed to check service ${service}: ${error.message}`,
            'error'
        );
        res.status(500).json({ 
            error: 'Failed to check service',
            message: error.message
        });
    }
});

// Start server
const PORT = config.monitoring.port;
app.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);
    alerts.sendAlert(
        `Monitoring service started on port ${PORT}`,
        'info'
    ).then(() => {
        // Run initial check
        runServiceChecks();
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    await alerts.sendAlert('Monitoring service shutting down...', 'warning');
    process.exit(0);
});