// Deps =========================================
const moment = require('moment');
const Pkg = require('~/package.json');
const os = require('os');

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    //== Heartbeat Route
    plugin.route({
        method: 'GET',
        path: '/heartbeat',
        config: { auth: false },
        handler: (request, reply) => reply(`{ts '${moment().format('YYYY-MM-DD hh:mm:ss')}'} Server: ${os.hostname()}`)
    });

    //== Move Along
    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'heartbeat',
    version: Pkg.version
};
