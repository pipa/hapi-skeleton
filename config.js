// Deps =========================================
const Confidence = require('confidence');
const Pkg = require('~/package.json');

// Internals ====================================
const internals = {
    defaults: {
        env: process.env.NODE_ENV || 'dev'
    },
    mongo: {
        db: 'skeleton',
        // connections: [
        //     {
        //         host: 'aws-us-east-1-portal.12.dblayer.com',
        //         port: 15324,
        //     },
        //     {
        //         host: 'aws-us-east-1-portal.15.dblayer.com',
        //         port: 15324,
        //     }
        // ],
        connections: {
            // host: 'mongodb01.flukyfactory.com',
            // port: 49151,
            host: 'localhost',
            port: 27017
        },
        mongoOptions: {
            // user: 'user',           // auth
            // pass: 'pass',           // auth
            // mongos: {}              // required when multiple-mongos
            // replset: {}             // when a ReplSet is needed
        }
    },
    store: null
};

// Config =======================================
internals.config = {
    root: __dirname,
    env: internals.defaults.env,
    database: {
        mongodb: internals.mongo
    },
    mailer: {
        'host': 'smtp.gmail.com',
        'port': 465,
        'secure': true,
        'auth': {
            'user': 'test@test.com',
            'pass': 'soporte01'
        },
        'envelope': {
            'name': 'test',
            'from': 'test@test.com'
        }
    },
    manifest: {
        server: {
            cache: {
                engine: require('catbox-redis'),
                host: 'portal.clever-redis.quickcar-rental.composedb.com',
                port: 15924,
                password: 'IJEAHUIIIQYPNHNR',
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
                    prd: 8000,
                    $default: 1806
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
            { plugin: './plugins/mailer' },
            { plugin: './plugins/shutdown' },
            { plugin: './plugins/auth' },
            { plugin: './plugins/madero' },
            {
                plugin: {
                    register: 'yar',
                    options: {
                        name: 'session',
                        maxCookieSize: 0,
                        cookieOptions: {
                            password: '!?fR!Jd,?3,M}V53mEVG8r}q6m8@~=%7',
                            isSecure: false
                        }
                    }
                }
            },
            {
                plugin: {
                    register: 'lout',
                    options: {
                        'apiVersion': Pkg.version
                    }
                }
            },
            {
                plugin: {
                    register: './plugins/db',
                    options: internals.mongo
                }
            }
        ]
    }
};

// Creating confidence store ====================
internals.store = new Confidence.Store(internals.config);

// Exposing GET method fro retrieving conf ======
exports.get = (key, opts = {}) => {

    const criteria = Object.assign({}, internals.defaults, opts);

    return internals.store.get(key, criteria);
};
