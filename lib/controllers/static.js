'use strict';

// Load Modules =================================
const moment = require('moment');

// Internals ====================================
const internals = {
    path: `${__dirname}/../../static`
};

// Generic Assets ===============================
internals.genAssets = {
    directory: {
        path: `${internals.path}`,
        index: false
    }
};

// Heartbeat ====================================
internals.heartbeat = {
    handler: (request, reply) => {

        return reply(`${moment()}`);
    }
};

// Routes Conf ==================================
internals.routes = [
    { method: 'GET',  path: '/static/{path*}', handler: internals.genAssets },
    { method: 'GET',  path: '/heartbeat', config: internals.heartbeat }
];

// Exposing =====================================
module.exports = internals;
