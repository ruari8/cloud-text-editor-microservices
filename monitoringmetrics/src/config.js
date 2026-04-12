const config = {
    proxy: {
        host: 'http://192.168.0.100:3000',
        endpoints: {
            wordcount: '/wordcount',
            charcount: '/charcount',
            rewrite: '/rewrite',
            wordfreq: '/frequency',
            averageLength: '/average',
            findReplace: '/FindReplace/replace'
        }
    },
    direct: {
        wordcount: 'http://192.168.0.100:8080',
        charcount: 'http://192.168.0.100:8081',
        rewrite: 'http://192.168.0.100:8082/rewrite',
        wordfreq: 'http://192.168.0.100:8083/frequency',
        averageLength: 'http://192.168.0.100:8084/analyze',
        findReplace: 'http://192.168.0.100:8085/FindReplace/replace'
    },
    monitoring: {
        checkInterval: '*/5 * * * *',  // Every 5 minutes
        port: 3001,
        responseTimeThreshold: 2000,    // Alert if response time > 1000ms
        retryAttempts: 2,              // Number of retries before marking as failed
        retryDelay: 1000,              // Delay between retries in ms
        alertThresholds: {
            responseTime: {
                warning: 2000,     // Alert if response time > 2000ms
                critical: 5000     // Critical alert if response time > 5000ms
            },
            errorRate: {
                warning: 0.1,      // Alert if error rate > 10%
                critical: 0.25     // Critical alert if error rate > 25%
            },
            consecutiveFailures: {
                warning: 2,        // Alert after 2 consecutive failures
                critical: 3        // Critical alert after 3 consecutive failures
            }
        }
    },
    telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
        enabled: true
    }
};

module.exports = config;