// Configuration for different environments
const config = {
    development: {
        // All requests now go through the proxy
        proxy: 'http://192.168.0.100:3000',
        wordcount: '/wordcount',
        charcount: '/charcount',
        rewrite: '/rewrite',
        wordfreq: '/frequency',
        averageLength: '/average',
        findReplace: '/FindReplace/replace',
        save: '/save',
        load: '/load'
    },
    production: {
        // Production proxy URL would go here
        proxy: 'TBD',
        wordcount: '/wordcount',
        charcount: '/charcount',
        rewrite: '/rewrite',
        wordfreq: '/frequency',
        averageLength: '/average',
        findReplace: '/FindReplace/replace',
        save: '/save',
        load: '/load'
    }
};

// Determine environment based on hostname
//const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
const ENV = 'development';
console.log(ENV);
const API_CONFIG = Object.fromEntries(
    Object.entries(config[ENV])
        .filter(([key]) => key !== 'proxy')
        .map(([key, path]) => [
            key, 
            `${config[ENV].proxy}${path}`
        ])
);

console.log('API Configuration:', API_CONFIG);

