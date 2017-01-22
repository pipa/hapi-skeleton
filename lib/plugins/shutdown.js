/* $lab:coverage:off$ */
// Load Modules ==============================
const Pckg = require('~/package.json');

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

        plugin.log(['app', 'stop'], {
            message: `${ Pckg.name.toUpperCase() } server stopped by process signal: ${ processSignal }`
        });
        // plugin.server.plugins.db.stop()
        plugin.root.stop({ timeout: settings.timeout }, settings.stopCallback);
    };

    process.on('SIGINT', () => stopServer('Interrupt `SIGINT`')); // interrupt signal
    process.on('SIGTERM', () => stopServer('Termination `SIGTERM`')); // termination signal

    // plugin.expose('stopServer', stopServer('test'));

    //== Move Along
    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'shutdown',
    version: Pckg.version
};
/* $lab:coverage:on$ */
