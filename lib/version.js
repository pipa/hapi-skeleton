'use strict';

// load modules =========================================

const Pkg = require('../package.json');

// Declare the internals ================================
const internals = {
    reponse: {
        version: Pkg.version
    }
};

// Exposing =============================================
exports.register = (server, options, next) => {
    
    server.route({
        method: 'GET',
        path: '/version',
        config:{
            description: 'return the version of the server',
            handler: (request, reply) => {
                
                return reply(internals.response);
            }
        }
    });

    return next();
}

exports.register.attributes = {
    name: 'version'
};