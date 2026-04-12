const axios = require('axios');
const config = require('./config');
const AlertManager = require('./alerts');
const alerts = new AlertManager();

// Test cases for all three services
const testCases = {
    wordcount: [
        { 
            input: "hello world testing", 
            expected: 3,
            description: "Basic word count" 
        },
        { 
            input: "hello!!! world... how are you?", 
            expected: 5,
            description: "Punctuation handling" 
        },
        { 
            input: "hello     world    test",
            expected: 3,
            description: "Multiple spaces" 
        },
        { 
            input: "",
            expectError: true,
            validateResponse: (r) => r.error || r?.message?.includes('empty'),
            description: "Empty input" 
        }
    ],
    charcount: [
        { 
            input: "hello world", 
            expected: 11,
            description: "Basic character count" 
        },
        { 
            input: "special @#$% chars", 
            expected: 18,
            description: "Special characters" 
        },
        { 
            input: "   spaces   ", 
            expected: 12,
            description: "Handle spaces" 
        },
        { 
            input: "",
            expectError: true,
            validateResponse: (r) => r.error || r?.message?.includes('empty'),
            description: "Empty input" 
        }
    ],
    rewrite: [
        {
            input: "Hello world how are you today?",
            style: "Shakespeare",
            validateResponse: (r) => r?.rewritten_text && r.rewritten_text.length > 0,
            description: "Basic rewrite with Shakespeare style"
        },
        {
            input: "",
            style: "Shakespeare",
            expectError: true,
            validateResponse: (r) => r.error || r?.message?.includes('empty'),
            description: "Empty input"
        }
    ],
    wordfreq: [
        {
            input: "hello world hello test hello",
            validateResponse: (r) => r.frequencies?.hello === 3 && r.frequencies?.world === 1 && r.frequencies?.test === 1,
            description: "Basic frequency count"
        },
        {
            input: "Hello WORLD hello world",
            validateResponse: (r) => r.frequencies?.hello === 2 && r.frequencies?.world === 2,
            description: "Case insensitive counting"
        },
        {
            input: "",
            expectError: true,
            validateResponse: (r) => r==="Text cannot be empty",
            description: "Empty input"
        }
    ],
    averageLength: [
        {
            input: "hello world",
            validateResponse: (r) => Math.abs(r.average_length - 5.0) < 0.01 && r.word_count === 2,
            description: "Basic average calculation"
        },
        {
            input: "a bb ccc dddd",
            validateResponse: (r) => Math.abs(r.average_length - 2.5) < 0.01 && r.word_count === 4,
            description: "Varying word lengths"
        },
        {
            input: "",
            expectError: true,
            validateResponse: (r) => r?.message?.includes('Empty'),
            description: "Empty input"
        }
    ],
    findReplace: [
        {
            input: "hello world hello",
            find: "hello",
            replace: "hi",
            validateResponse: (r) => r.processedText === "hi world hi",
            description: "Basic find and replace"
        },
        {
            input: "test test test",
            find: "test",
            replace: "checked",
            validateResponse: (r) => r.processedText === "checked checked checked",
            description: "Multiple replacements"
        },
        {
            input: "",
            find: "test",
            replace: "checked",
            expectError: true,
            validateResponse: (r) => r.includes("cannot be empty"),
            description: "Empty input"
        }
    ]
};

// Track service health
let serviceHealth = {
    direct: {},
    proxy: {}
};

async function makeRequest(url, testCase, serviceName) {
    const startTime = Date.now();
    let response;
    
    try {
        switch(serviceName) {
            case 'wordcount':
                const formData = new URLSearchParams();
                formData.append('text', testCase.input);
                response = await axios.post(url, formData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                break;

            case 'findReplace':
                response = await axios.post(url, {
                    InputText: testCase.input,
                    FindWord: testCase.find,
                    ReplaceWord: testCase.replace
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                break;

            case 'rewrite':
                response = await axios.post(url, {
                    text: testCase.input,
                    style: testCase.style
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                break;

            default: // charcount, wordfreq, averageLength
                response = await axios.post(url, {
                    text: testCase.input
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                break;
        }

        const responseTime = Date.now() - startTime;

        if (responseTime > config.monitoring.responseTimeThreshold) {
            await alerts.sendAlert(
                `Slow response from ${serviceName}: ${responseTime}ms`,
                'warning'
            );
        }

        return {
            success: true,
            data: response.data,
            responseTime,
            error: null
        };
    } catch (error) {
        if (error.response && testCase.expectError) {
            // Special handling for wordfreq plain text error
            if (serviceName === 'wordfreq' && error.response.headers['content-type']?.includes('text/plain')) {
                return {
                    success: false,
                    data: error.response.data,
                    responseTime: Date.now() - startTime,
                    error: error.response.data
                };
            }
            return {
                success: false,
                data: error.response.data,
                responseTime: Date.now() - startTime,
                error: error.response.data
            };
        }

        return {
            success: false,
            data: null,
            responseTime: Date.now() - startTime,
            error: error.message
        };
    }
}


function validateResponse(testCase, response, serviceName) {
    if (testCase.expectError) {
        if (testCase.validateResponse) {
            return testCase.validateResponse(response.data);
        }
        return response.success === false;
    }

    if (!response.success) {
        return false;
    }

    switch(serviceName) {
        case 'wordcount':
            return response.data.answer === testCase.expected;
        
        case 'charcount':
            return response.data.answer === testCase.expected;
        
        case 'rewrite':
        case 'wordfreq':
        case 'averageLength':
        case 'findReplace':
            return testCase.validateResponse(response.data);
            
        default:
            return false;
    }
}

async function checkService(serviceName, mode = 'direct') {
    if (!['wordcount', 'charcount', 'rewrite', 'wordfreq', 'averageLength', 'findReplace'].includes(serviceName)) {
        return {
            service: serviceName,
            timestamp: new Date().toISOString(),
            status: 'not implemented',
            mode: mode
        };
    }

    const results = {
        service: serviceName,
        timestamp: new Date().toISOString(),
        tests: [],
        responseTime: 0,
        status: 'healthy',
        mode: mode
    };

    const baseUrl = mode === 'direct' 
        ? config.direct[serviceName]
        : `${config.proxy.host}${config.proxy.endpoints[serviceName]}`;

    try {
        for (const testCase of testCases[serviceName]) {
            let response;
            let attempts = 0;
            
            while (attempts < config.monitoring.retryAttempts) {
                response = await makeRequest(baseUrl, testCase, serviceName);
                if (response.success || testCase.expectError) break;
                
                attempts++;
                if (attempts < config.monitoring.retryAttempts) {
                    await alerts.sendAlert(
                        `Retry ${attempts}/${config.monitoring.retryAttempts} for ${serviceName} (${mode}) - ${testCase.description}`,
                        'warning'
                    );
                    await new Promise(resolve => setTimeout(resolve, config.monitoring.retryDelay));
                }
            }

            const testPassed = validateResponse(testCase, response, serviceName);
            results.responseTime += response.responseTime;

            results.tests.push({
                description: testCase.description,
                input: testCase.input,
                expected: testCase.expected,
                actual: response.data,
                passed: testPassed,
                responseTime: response.responseTime,
                error: response.error
            });

            if (!testPassed && !testCase.expectError) {
                results.status = 'failing';
            }
        }

        if (results.tests.length > 0) {
            results.responseTime = results.responseTime / results.tests.length;
        }

        serviceHealth[mode][serviceName] = results;
        await alerts.sendServiceStatus(serviceName, results);

        return results;

    } catch (error) {
        results.status = 'failing';
        results.error = error.message;
        await alerts.sendAlert(
            `Service ${serviceName} (${mode}) check failed: ${error.message}`,
            'critical'
        );
        return results;
    }
}

async function checkAllServices() {
    const results = {
        direct: {},
        proxy: {}
    };

    // Check all three services
    for (const service of ['wordcount', 'charcount', 'rewrite', 'wordfreq', 'averageLength', 'findReplace']) {
        results.direct[service] = await checkService(service, 'direct');
        results.proxy[service] = await checkService(service, 'proxy');
    }

    return results;
}

function getHealthStatus() {
    return serviceHealth;
}

module.exports = {
    checkService,
    checkAllServices,
    getHealthStatus
};