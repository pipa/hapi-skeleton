// Load Modules =================================
const Confidence = require('confidence');
const Pkg = require('~/package.json');

// Internals ====================================
const internals = {
    defaults: {
        /* $lab:coverage:off$ */
        env: process.env.NODE_ENV || 'dev'
        /* $lab:coverage:on$ */
    },
    mongo: {
        db: 'skeleton',
        host: 'localhost',
        port: 27017
    },
    store: null
};

// Config =======================================
internals.config = {
    root: `${__dirname}/..`,
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
        connections: [
            {
                'labels': ['api'],
                'routes': {
                    'cors': true
                },
                'port': {
                    $filter: 'env',
                    prd: 8080,
                    $default: 8085
                },
                'host': {
                    $filter: 'env',
                    prd: '127.0.0.1',
                    $default: 'localhost'
                }
            }
        ],
        registrations: [
            {
                'plugin': 'hapi-boom-jsend',
                'options': {
                    'select': ['api']
                }
            },
            {
                'plugin': 'vision',
                'options': {
                    'select': ['api']
                }
            },
            {
                'plugin': 'inert',
                'options': {
                    'select': ['api']
                }
            },
            {
                'plugin': {
                    'register': 'lout',
                    'options': {
                        'apiVersion': Pkg.version
                    }
                },
                'options': {
                    'select': ['api']
                }
            },
            {
                'plugin': './plugins/routes',
                'options': {
                    'select': ['api']
                }
            },
            {
                'plugin': './plugins/mailer',
                'options': {
                    'select': ['api']
                }
            },
            {
                'plugin': {
                    'register': './plugins/db',
                    'options': internals.mongo
                },
                'options': {
                    'select': ['api']
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
