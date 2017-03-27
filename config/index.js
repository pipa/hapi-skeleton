// Deps =========================================
const confidence = require('confidence');
const path = require('path');

// Internals ====================================
const internals = {
    defaults: {
        /* $lab:coverage:off$ */
        env: process.env.NODE_ENV || 'dev'
        /* $lab:coverage:on$ */
    },
    store: null
};

// Config =======================================
internals.config = {
    root: path.resolve(__dirname, '../'),
    env: internals.defaults.env,
    jwt: {
        $filter: 'env',
        $default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkIxSURJanIzZSIsImFwcCI6IlJFeC1Gcm9udC1EZXYiLCJhY2Nlc3MiOlsiZnJvbnQiLCJkZXYiXSwiaWF0IjoxNDkwNTYwNjA2fQ.OmJLJhkYO_SnbgjrN_mQsFP-PrMpgxrfBMIIBlhDW5c',
        prd: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InIxNVdJc1MyeCIsImFwcCI6IlJFeC1Gcm9udCIsImFjY2VzcyI6WyJmcm9udCJdLCJpYXQiOjE0OTA1NjA1MTN9.ugLX_QcHrgJ-5HG2qkJTv4H2Z8blehhNmrxGghEbnR8',
    },
    urls: {
        assets: '/static'
    },
    api: {
        // host: 'http://rexapi.flukyfactory.com'
        host: {
            $filter: 'env',
            prd: 'http://rexapi.flukyfactory.com',
            $default: 'http://localhost:1806'
        }
    },
    manifest: {
        server: {
            cache: {
                engine: require('catbox-redis'),
                host: 'localhost',
                port: 6379,
                partition: 'cache'
            }
        },
        connections: [
            {
                routes: {
                    cors: true
                },
                port: {
                    $filter: 'env',
                    prd: 8080,
                    $default: 1607
                },
                host: {
                    $filter: 'env',
                    prd: '127.0.0.1',
                    $default: 'localhost'
                }
            }
        ],
        registrations: [
            { plugin: 'hapi-boom-jsend' },
            { plugin: 'vision' },
            { plugin: 'inert' },
            { plugin: 'scooter' },
            { plugin: './plugins/heartbeat' },
            { plugin: './plugins/router' },
            { plugin: './plugins/seo' },
            { plugin: './plugins/madero' },
            // { plugin: './plugins/session' },
            // { plugin: './plugins/auth' }
        ]
    }
};

// Creating confidence store ====================
internals.store = new confidence.Store(internals.config);

// Exposing GET method fro retrieving conf ======
exports.get = (key, opts = {}) => {

    const criteria = Object.assign({}, internals.defaults, opts);

    return internals.store.get(key, criteria);
};
