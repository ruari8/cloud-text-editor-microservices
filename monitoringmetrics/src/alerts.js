const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

class AlertManager {
    constructor() {
        this.bot = new TelegramBot(config.telegram.token, { polling: false });
        this.chatId = config.telegram.chatId;
        this.dailyStats = {
            totalChecks: 0,
            failedChecks: 0,
            slowResponses: 0,
            serviceStats: {}
        };
        // Reset daily stats at midnight
        this.scheduleDailyReset();
    }

    scheduleDailyReset() {
        const now = new Date();
        const night = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1, // tomorrow
            0, 0, 0 // midnight
        );
        const msToMidnight = night.getTime() - now.getTime();

        setTimeout(() => {
            this.sendDailySummary();
            this.resetDailyStats();
            this.scheduleDailyReset();
        }, msToMidnight);
    }

    resetDailyStats() {
        this.dailyStats = {
            totalChecks: 0,
            failedChecks: 0,
            slowResponses: 0,
            serviceStats: {}
        };
    }

    async sendDailySummary() {
        const successRate = ((this.dailyStats.totalChecks - this.dailyStats.failedChecks) / 
                           this.dailyStats.totalChecks * 100).toFixed(2);
        
        let message = `📊 *Daily Monitoring Summary*\n`;
        message += `Total Checks: ${this.dailyStats.totalChecks}\n`;
        message += `Success Rate: ${successRate}%\n`;
        message += `Slow Responses: ${this.dailyStats.slowResponses}\n\n`;
        
        // Add per-service statistics
        message += `*Service Performance*:\n`;
        for (const [service, stats] of Object.entries(this.dailyStats.serviceStats)) {
            const serviceSuccessRate = ((stats.checks - stats.failures) / 
                                     stats.checks * 100).toFixed(2);
            message += `\`${service}\`: ${serviceSuccessRate}% success rate\n`;
            message += `Avg Response: ${(stats.totalResponseTime / stats.checks).toFixed(2)}ms\n`;
        }

        await this.bot.sendMessage(this.chatId, message, {
            parse_mode: 'Markdown'
        });
    }

    async sendAlert(message, severity = 'warning') {
        // Only send immediate alerts for warning and above
        if (severity === 'info') {
            return; // Skip info-level messages
        }

        try {
            const emoji = this.getSeverityEmoji(severity);
            const formattedMessage = `${emoji} *${severity.toUpperCase()}*\n${message}`;

            await this.bot.sendMessage(this.chatId, formattedMessage, {
                parse_mode: 'Markdown'
            });
        } catch (error) {
            console.error('Failed to send Telegram alert:', error);
        }
    }

    async sendServiceStatus(service, results) {
        // Update daily statistics
        this.dailyStats.totalChecks++;
        if (!this.dailyStats.serviceStats[service]) {
            this.dailyStats.serviceStats[service] = {
                checks: 0,
                failures: 0,
                totalResponseTime: 0
            };
        }

        const stats = this.dailyStats.serviceStats[service];
        stats.checks++;
        stats.totalResponseTime += results.responseTime;

        // Only send immediate alerts for failures or performance issues
        if (results.status !== 'healthy') {
            stats.failures++;
            this.dailyStats.failedChecks++;

            let message = `❌ *Service Alert*\n`;
            message += `Service: \`${service}\` (${results.mode})\n`;
            message += `Status: ${results.status}\n`;
            message += `Response Time: ${results.responseTime.toFixed(2)}ms\n`;

            const failedTests = results.tests.filter(t => !t.passed);
            if (failedTests.length > 0) {
                message += '\nFailed Tests:';
                failedTests.forEach(test => {
                    message += `\n• ${test.description}`;
                    if (test.error) {
                        message += ` - ${test.error}`;
                    }
                });
            }

            await this.sendAlert(message, 'error');
        }

        // Alert on slow response times
        if (results.responseTime > config.monitoring.responseTimeThreshold) {
            this.dailyStats.slowResponses++;
            await this.sendAlert(
                `🐌 *Slow Response*\n` +
                `Service: \`${service}\` (${results.mode})\n` +
                `Response Time: ${results.responseTime.toFixed(2)}ms\n` +
                `Threshold: ${config.monitoring.responseTimeThreshold}ms`,
                'warning'
            );
        }
    }

    getSeverityEmoji(severity) {
        switch (severity.toLowerCase()) {
            case 'critical':
                return '🚨';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            case 'success':
                return '✅';
            default:
                return '📢';
        }
    }
}

module.exports = AlertManager;