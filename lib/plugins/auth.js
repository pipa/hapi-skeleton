// Load Modules =================================
const hapiJWT = require('hapi-auth-jwt2');
const JWT = require('jsonwebtoken');
const Pkg = require('~/package.json');

// Internals ====================================
const internals = {
    key: 'dHJ1c3RubzE=',
    validate: (decoded, request, next) => {

        return next(null, true);
    }
};

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    //== Register jwt plugin
    plugin.register(hapiJWT);

    //== Set the auth strategy
    plugin.auth.strategy('jwt', 'jwt', {
        key: internals.key,
        validateFunc: internals.validate,
        verifyOptions: {
            algorithms: ['HS256']
        }
    });

    plugin.route({
        method: 'GET',
        path: '/',
        config: { auth: false },
        handler: (request, reply) => {

            const token = JWT.sign({
                foo: 'bar'
            }, internals.key);

            return reply(token);
        }
    });

    //== Request auth for everything
    plugin.auth.default('jwt');

    //== Move Along
    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'auth-wrapper',
    version: Pkg.version
};
