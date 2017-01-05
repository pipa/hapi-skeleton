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
            desc: `${ Pckg.name.toUpperCase() } server stopped by process signal: ${ processSignal }`
        });
        plugin.root.stop({ timeout: settings.timeout }, settings.stopCallback());
    };

    process.on('SIGINT', () => stopServer('Interrupt `SIGINT`')); // interrupt signal
    process.on('SIGTERM', () => stopServer('Termination `SIGTERM`')); // termination signal

    //== Move Along
    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'hapi-shutdown',
    version: Pckg.version
};
