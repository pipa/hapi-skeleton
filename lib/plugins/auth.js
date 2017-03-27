// Deps =========================================
const config = require('~/config');
const bell = require('bell');
const boom = require('boom');
const jsend = require('jsend')
const wreck = require('wreck');
const pkg = require('~/package.json');

// Internals ====================================
const internals = {};

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    // Register bell - Third-party login plugin for hapi
    plugin.register(bell);

    // Set FB login strategy
    plugin.auth.strategy('facebook', 'bell', {
        provider: 'facebook',
        password: 'fHA9V2eQAd&kKtX8_Hh3fF8Jij@URun_',
        isSecure: false,
        clientId: '1832710073664311',
        clientSecret: '9d153704d840ed42d7d169dbc00f0654',
        location: plugin.info.uri
    });

    // Auth route
    plugin.route({
        method: '*',
        path: '/bell/door',
        config: {
            auth: 'facebook',
            handler: (request, reply) => {

                if (!request.auth.isAuthenticated) {
                    return reply(boom.unauthorized(`Authentication failed due to: ${ request.auth.error.message }`));
                }

                console.log(plugin.root.app);
                // wreck.get('', { json: true }, (err, res, payload));

                return reply(jsend.success(request.auth.credentials));
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/need-auth',
        handler: (request, reply) => {

            return reply(jsend.success({ test: 1 }));
        }
    });

    plugin.route({
        method: 'GET',
        path: '/no-auth',
        config: { auth: false },
        handler: (request, reply) => {

            return reply(jsend.success({ test: 2 }));
        }
    });

    //== Request auth for everything
    // plugin.auth.default('facebook');

    // Move Along
    return next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'belldoor',
    version: pkg.version
};
