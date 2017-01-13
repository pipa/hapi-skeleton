// Deps =========================================
const Pkg = require('~/package.json');

// Exposing =====================================
exports.register = (server, options, next) => {

    server.route({
        method: 'GET',
        path: '/version',
        config: {
            description: 'return the version of the server',
            handler: (request, reply) => {

                return reply({
                    version: Pkg.version
                });
            }
        }
    });

    return next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'version'
};
