// Deps =========================================
const hoek = require('hoek')
const shortid = require('shortid');
const pkg = require('~/package.json');

// Internals declaration ========================
const internals = {
    defaults: {
        cache: {
            expiresIn: 24 * 60 * 60 * 1000          // One day session
        },
        cookieOptions: {                            // hapi server.state() options, except 'encoding' which is always 'iron'. 'password' is required.
            clearInvalid: true,
            ignoreErrors: true,
            isSameSite: 'Lax',                      // Use same-site cookie security, but in a loose way
            isSecure: false,
            password: 'the-password-must-be-at-least-32-characters-long',
            path: '/'
        },
        errorOnCacheNotReady: true,
        maxCookieSize: 1024,                        // Maximum size allowed in a cookie
        name: 'bout',                            // Cookie name
    }
};

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    const settings = hoek.applyToDefaults(internals.defaults, options);

    // Setting defaults
    settings.cookieOptions.encoding = 'iron';

    // Configure Cookie
    plugin.state(settings.name, settings.cookieOptions);

    // Decorate request
    plugin.decorate('request', 'bout', () => ({}), { apply: true });

    // Setup session store
    const cache = plugin.cache(settings.cache);

    // preAuth handler
    plugin.root.ext('onPreAuth', (request, reply) => {

        const generateSessionID = () => {

            const event = {
                message: 'Session created'
            };

            request.log(['info', 'session', 'start'], event);

            return event.session;
        };

        const load = () => {

            request.bout = Object.assign(request.bout, request.state[settings.name]);

            if (request.bout.id) {

                request.bout._isModified = false;

                request.bout._store = {};
                return cache.get(request.bout.id, (err, value, cached) => {

                    if (err) {
                        return decorate(err);
                    }

                    if (cached && cached.item) {
                        request.bout._store = cached.item;
                    }

                    return decorate();
                });
            }

            request.bout.id = generateSessionID();
            request.bout._store = {};
            request.bout._isModified = true;

            decorate();
        };

        const decorate = (err) => {

            if (err) {
                return reply(err);
            }

            // reset
            const reset = () => {

                cache.drop(request.bout.id, () => {});
                request.bout.id = generateSessionID();
                request.bout._store = {};
                request.bout._isModified = true;
            };

            // get
            const get = (key) => request.bout._store[key];

            // set
            const set = (key, value) => {

                request.bout._isModified = true;
                request.bout._store[key] = value;

                return value !== undefined ? value : key;
            };

            request.bout = Object.assign(request.bout, { reset, get, set });

            return reply.continue();
        };

        load();
    });

    // Post handler
    plugin.root.ext('onPreResponse', (request, reply) => {

        if (!request.bout._isModified) {

            return reply.continue();
        }

        if (!settings.errorOnCacheNotReady && !cache.isReady()) {
            request.log('Cache is not ready: not storing sessions to cache');

            return reply.continue();
        }

        reply.state(settings.name, { id: request.bout.id });
        cache.set(request.bout.id, request.bout._store, 0, (err) => {

            if (err) {
                return reply(err);
            }

            return reply.continue();
        });
    });

    // Move Along
    return next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'bout',
    version: pkg.version
};
