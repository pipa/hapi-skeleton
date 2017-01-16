// Deps =========================================
const GoodFile = require('good-file');
const Config = require('~/config');
const Pkg = require('~/package.json');
const moment = require('moment');
const hoek = require('hoek');
const os = require('os');

// Internals ====================================
const internals = {
    settings: {
        path: `${ Config.get('/root') }/logs`,
        signals: true,
        uncaughtException: true,
        exclude: [],
        types: ['info', 'database', 'error', 'app', 'warning', 'request']
    },
    defaults: {
        type: 'info'
    }
};

internals.prepEntry = (event, request, settings = internal.settings) => {

    event = Object.assign({}, internals.defaults, event);

    let logFile = null;
    let logString = '';
    const { msg, type, file } = event;
    const now = moment();
    const filename = file || 'info';
    let log = {
        type,
        logDate: now.format('MM-DD-YYYY'),
        logTime: now.format('hh:mm:ss'),
        host: os.hostname()
    };

    if (request) {
        const scoot = request.plugins.scooter.toJSON();
        const { method, info, headers, route } = request;
        const req = {
            method,
            remoteIP: info.remoteAddress,
            routePath: route.path,
            referrer: info.referrer,
            useragent: headers['user-agent'],
            ua_browser: `${scoot.family} v${scoot.major}.${scoot.minor}.${scoot.patch}`,
            ua_device: `${scoot.device.family} v${scoot.device.major}.${scoot.device.minor}.${scoot.device.patch}`,
            ua_os: `${scoot.os.family} v${scoot.os.major}.${scoot.os.minor}.${scoot.os.patch}`
        };

        Object.assign(log, req);
    }

    for (prop in log) {
        if ({}.hasOwnProperty.call(log, prop)) {
            logString = `${ logString }${ prop }="${ log[prop] }" `;
        }
    }

};

// Writes to file ===============================
internals.write = (opts, logString) => {

    logFile = new GoodFile(`${ opts.path }/${ opts.filename }.log`);
    logFile.write(`${ logString.trim() }\n`);
};

// Exposing Routes ==============================
exports.register = (plugin, options, next) => {

    //== Defaults with options passed in
    Object.assign(internals.settings, options);
    const { settings } = internals;

    const onPostStop = function (srv, nextExt) {

        if (settings.signals) {
            process.removeAllListeners('SIGTERM');
            process.removeAllListeners('SIGINT');
        }

        // const end = internals.update('server', null, settings);
        // end.tags = ['bananas', 'stopped'];
        // updates.push(end);
        // return flush(nextExt);
    };

    //== Listen to system exceptions and signals
    if (settings.uncaughtException) {
        process.once('uncaughtException', (err) => {

            // const uncaught = internals.update('error', null, settings);
            // uncaught.error = {
            //     message: err.message,
            //     stack: err.stack,
            //     data: err.data
            // };

            // uncaught.tags = ['bananas', 'uncaught', 'error'];
            // updates.push(uncaught);

            // return flush((ignore) => {

            //     process.exit(1);
            // });
        });

        process.on('unhandledRejection', (err, promise) => {

            // const uncaught = internals.update('error', null, settings);
            // uncaught.error = {
            //     message: err.message,
            //     stack: err.stack,
            //     data: err.data
            // };

            // uncaught.tags = ['bananas', 'uncaught', 'promise', 'error'];
            // updates.push(uncaught);
        });
    }

    if (settings.signals) {
        const shutdown = (signal) => {

            return () => {

                // const end = internals.update('server', null, settings);
                // end.tags = ['bananas', 'signal', signal];
                // updates.push(end);
                // server.root.stop({ timeout: settings.stopTimeoutMsec }, process.exit);
            };
        };

        process.once('SIGTERM', shutdown('SIGTERM'));
        process.once('SIGINT', shutdown('SIGINT'));
    }

    //== Listen to server events
    plugin.ext('onPostStop', onPostStop);

    //== Subscribe to server events
    plugin.on('log', (event, tags) => { });
    plugin.on('request', (request) => {

        internals.write({ test: 1 }, request, settings);
    });
    plugin.on('request-error', (request, err) => { });

    //== Kickstart
    internals.write({ foo: 'bar' }, null, settings);

    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'madero',
    version: Pkg.version
};
