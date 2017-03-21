'use strict';

// Load Modules ==============================
const Pckg = require('../../package.json');

// Internals ====================================
const internals = {
    defaults: {
        timeout: 5 * 1000,
        stopCallback: (err) => {

            if (err) {
                return process.exit(1);
            }

            return process.exit(0);
        }
    }
};

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    const settings = Object.assign({}, internals.defaults, options);
    const stopServer = (processSignal) => {

        plugin.log('app', `${Pckg.name} server stopped by process signal: ${processSignal}`);
        plugin.root.stop({ timeout: settings.timeout }, settings.stopCallback);
    }

    process.on('SIGINT', () => stopServer('SIGINT'))
    process.on('SIGTERM', () => stopServer('SIGTERM'))

    //== Move Along
    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'hapi-shutdown',
    version: Pckg.version
};
