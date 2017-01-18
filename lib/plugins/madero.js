// Deps =========================================
const GoodFile = require('good-file');
const config = require('~/config');
const pkg = require('~/package.json');
const moment = require('moment');
const joi = require('joi');
const hoek = require('hoek');
const fs = require('fs');
const os = require('os');

// Internals ====================================
const internals = {
    settings: {
        path: `${ config.get('/root') }/logs`,
        types: ['info', 'database', 'error', 'server', 'warning', 'request'],
        stopTimeoutMsec: 15 * 1000
    }
};

// Write to file ===============================
internals.log = (event, options = {}, request = null, callback) => {

    //== Defaults schema
    const schema = {
        entry: joi.object().required().keys({
            msg: joi.string().required(),
            tags: joi.array().required().items(
                joi.string().required().valid(internals.settings.types),
                joi.string()
            )
        }),
        opts: joi.object().keys({
            file: joi.string().default('app'),
            type: joi.string().valid(internals.settings.types).default('info'),
            async: joi.boolean().default(true)
        })
    };

    //== Done callback
    const done = callback || hoek.ignore;

    //== Validate and merge options
    const result = joi.validate({ entry: event, opts: options }, schema, { allowUnknown: true });

    //== Check if schema validation had an error
    if (result.error !== null) {
        console.log(result.error);

        return false;
    }

    //== Basic data for a log entry
    let logString = '';
    let logFile = null;
    let prop;
    const { entry, opts } = result.value;
    const { type, file, async } = opts;
    const { path } = internals.settings;
    const filePath = `${ path }/${ file }.log`;
    const now = moment();
    const log = {
        type,
        logDate: now.format('MM-DD-YYYY'),
        logTime: now.format('hh:mm:ss'),
        host: os.hostname()
    };

    if (request) {
        //== Create data from request
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

        //== Add request vars to log object
        Object.assign(log, req);
    }

    //== Merging entry to log
    Object.assign(log, entry);

    //== Translate to key=value string
    for (prop in log) {
        if ({}.hasOwnProperty.call(log, prop)) {
            logString = `${ logString }${ prop }="${ log[prop] }" `;
        }
    }

    logString = `${ logString.trim() }\n`;

    //== Write to file Sync
    if (!async) {
        fs.appendFileSync(filePath, logString);

        return done();
    }

    //== Write to file Async
    logFile = new GoodFile(filePath);
    logFile.write(logString);

    return done();
};

// Exposing Routes ==============================
exports.register = (plugin, options, next) => {

    //== Defaults with options passed in
    Object.assign(internals.settings, options);
    const { settings, log } = internals;
    const server = plugin.root;

    const onPostStop = (srv, nextExt) => {

        const entry = {
            tags: ['server', 'stop'],
            msg: 'Server onPostStop - connection listeners are stopped'
        };

        process.removeAllListeners('SIGTERM');
        process.removeAllListeners('SIGINT');

        return log(entry, {}, null, nextExt);
    };

    //== Listen to system exceptions and signals
    // if (settings.uncaughtException) {
    //     process.once('uncaughtException', (err) => {

    //         // const uncaught = internals.update('error', null, settings);
    //         // uncaught.error = {
    //         //     message: err.message,
    //         //     stack: err.stack,
    //         //     data: err.data
    //         // };

    //         // uncaught.tags = ['bananas', 'uncaught', 'error'];
    //         // updates.push(uncaught);

    //         // return flush((ignore) => {

    //         //     process.exit(1);
    //         // });
    //     });

    //     process.on('unhandledRejection', (err, promise) => {

    //         // const uncaught = internals.update('error', null, settings);
    //         // uncaught.error = {
    //         //     message: err.message,
    //         //     stack: err.stack,
    //         //     data: err.data
    //         // };

    //         // uncaught.tags = ['bananas', 'uncaught', 'promise', 'error'];
    //         // updates.push(uncaught);
    //     });
    // }

    const shutdown = (signal) => {

        return () => {

            const entry = {
                tags: ['server', 'signal', signal.toLowerCase()],
                msg: `Server shutdown on signal: ${ signal }`
            };

            log(entry, { async: false });
            server.root.stop({ timeout: settings.stopTimeoutMsec }, process.exit);
        };
    };

    process.once('SIGTERM', shutdown('SIGTERM'));
    process.once('SIGINT', shutdown('SIGINT'));

    //== Listen to server events
    server.ext('onPostStop', onPostStop);

    //== Subscribe to server events
    server.on('log', (event, tags) => { });
    server.on('request', (request) => {

        internals.log({ test: 1 }, {}, request);
    });
    server.on('request-error', (request, err) => { });

    //== Exposing logging functionality
    plugin.expose('log', internals.log);

    //== Kickstart
    internals.log({ msg: 'Madero ready', tags: ['server', 'start'] });

    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'madero',
    version: pkg.version
};
