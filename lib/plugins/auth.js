// Deps =========================================
const hapiJWT = require('hapi-auth-jwt2');
const shortid = require('shortid');
const JWT = require('jsonwebtoken');
const Pkg = require('~/package.json');
const JSend = require('jsend');

// Internals ====================================
const internals = {
    key: 'dHJ1c3RubzE=',
    validate: (decoded, request, next) => {

        // console.log(decoded);

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
        path: '/get/token',
        config: { auth: false },
        handler: (request, reply) => {

            const data = {
                id: shortid.generate(),
                foo: 'bar'
            };
            const token = JWT.sign(data, internals.key, {
                // expiresIn: 30 * 1000
            });

            return reply(JSend.success({ token }));
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
