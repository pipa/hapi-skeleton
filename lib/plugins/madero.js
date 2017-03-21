// Deps =========================================
const GoodFile = require('good-file');
const config = require('~/config');
const pkg = require('~/package.json');
const moment = require('moment');
const joi = require('joi');
const hoek = require('hoek');
const fs = require('fs');
const os = require('os');
const chalk = require('chalk');
const prettyjson = require('prettyjson');
const stringify = require('fast-safe-stringify');

// Internals ====================================
const internals = {
    settings: {
        path: `${ config.get('/root') }/logs`,
        types: ['info', 'error', 'warning', 'request', 'plugin'],
        stopTimeoutMsec: 15 * 1000,
        silent: false
    }
};

// Write to file ================================

internals.log = (event, request = null, async = true, callback) => {

    //== Creates the normalized log entry and writes it to file
    //    @event {Object}
    //    @options {Object}
    //    @request {Object}
    //    @callback {Function}
    //    @return {Callback}
    //== ========================================

    // Defaults schema
    const schema = {
        entry: joi.object().required().keys({
            message: joi.string().required(),
            data: joi.object(),
            error: joi.object(),
            session: joi.string(),
            tags: joi.array().required().items(
                joi.string().required().valid(internals.settings.types),
                joi.string()
            )
        })
    };

    // Done callback
    const done = callback || hoek.ignore;

    // Validate and merge options
    const result = joi.validate({ entry: event }, schema, { allowUnknown: true });

    // Check if schema validation had an error
    if (result.error !== null) {
        internals.log2console(result.error, 'error');

        return done(result.error);
    }

    // Basic data for a log entry
    let logString = '';
    let logFile = null;
    const { entry, opts } = result.value;
    const { path, silent } = internals.settings;
    const now = moment();
    const log = {
        type: entry.tags.shift(),
        tags: entry.tags,
        message: entry.message,
        timestamp: now.valueOf(),
        host: os.hostname()
    };
    const filePath = `${ path }/${ log.type }.log`;

    if (request) {
        // Create data from request
        const scoot = request.plugins.scooter.toJSON();
        const { method, info, headers, route } = request;
        const req = {
            method,
            remoteIP: info.remoteAddress,
            routePath: route.path,
            referrer: info.referrer,
            received: request.info.received,
            elapsed: Date.now() - request.info.received,
            userAgent: {
                browser: `${scoot.family} v${scoot.major}.${scoot.minor}.${scoot.patch}`,
                device: `${scoot.device.family} v${scoot.device.major}.${scoot.device.minor}.${scoot.device.patch}`,
                os: `${scoot.os.family} v${scoot.os.major}.${scoot.os.minor}.${scoot.os.patch}`,
                raw: headers['user-agent']
            }
        };

        // Add auth data
        if (request.auth.credentials) {
            req.auth = {
                isAuthenticated: request.auth.isAuthenticated,
                credentials: request.auth.credentials
            };
        }

        // Add request vars to log object
        Object.assign(log, { request: req });
    }

    // Add data if available, to log
    if ('data' in entry) {
        log.data = entry.data;
    }

    // Add error data if available, to log
    if ('error' in entry) {
        log.error = entry.error;
    }

    if ('session' in entry) {
        log.sessionId = entry.sessionId;
    }

    logString = `${ stringify(log) }\n`;

    // Write to file Sync
    if (!async) {
        fs.appendFileSync(filePath, logString);

        return done();
    }

    // Write to file Async
    logFile = new GoodFile(filePath);
    logFile.write(logString);

    // Log to console if in dev
    if (log.type !== 'error' && !silent && config.get('/env') === 'dev') {
        console.log(logString.replace('\n', ''));
    }

    if (log.type === 'error') {
        internals.log2console(log, log.type);
    }

    return done();
};

// If error, add error signature to object ======
internals.error = (data) => {

    if (!('error' in data) && data.error instanceof Error === false) {
        return data;
    }

    const errData = data.error;
    const error = {
        message: errData.message,
        stack: errData.stack
    };

    if (errData.data) {
        error.data = errData.data;
    }

    return { error };
};

// Log to console ===============================
internals.log2console = (data, type = 'info', callback) => {

    let bg;
    let rem;
    let padStr;
    let count;
    const addPad = (str, pad = 48) => {

        rem = (pad - str.length) / 2;
        padStr = ` ${ str } `;

        count = 0;
        while (count < rem) {
            padStr = `=${ padStr }`;
            count++;
        }

        count = 0;
        while (count < rem) {
            padStr = `${ padStr }=`;
            count++;
        }

        padStr = (padStr.length > (pad + 2)) ? padStr.slice(0, -1) : padStr;

        return ` ${ padStr } `;
    };
    const done = callback || hoek.ignore;

    switch (type.toLowerCase()) {
        case 'error':
            bg = 'bgRed';
            break;
        case 'info':
            bg = 'bgBlue';
            break;
        case 'warn':
            bg = 'bgYellow';
            break;
        default:
            bg = 'bgGreen';
            break;
    }

    // Log to console
    console.log('');
    console.log(chalk[bg].bold.white(addPad(type)));
    console.log(prettyjson.render(data));
    console.log(chalk[bg].bold.white(addPad(`end ${ type }`)));
    console.log('');

    return done();
};

// Exposing Routes ==============================
exports.register = (plugin, options, next) => {

    //== Defaults with options passed in
    Object.assign(internals.settings, options);
    const { settings, log, log2console, error } = internals;
    const server = plugin.root;
    const onPostStop = (srv, nextEvt) => {

        const uptime = Date.now() - srv.info.created;
        const serverID = srv.info.id;
        const entry = {
            tags: ['info', 'app', 'stop'],
            message: {
                message: 'Server onPostStop - connection listeners are stopped',
                uptime, serverID
            }
        };

        process.removeAllListeners('SIGTERM');
        process.removeAllListeners('SIGINT');

        return log(entry, null, true, nextEvt);
    };
    const shutdown = (signal) => {

        return () => {

            const entry = {
                tags: ['info', 'app', 'signal', signal.toLowerCase()],
                message: `Server shutdown on signal: ${ signal }`
            };

            log(entry, null, false);
            server.root.stop({ timeout: settings.stopTimeoutMsec }, process.exit);
        };
    };

    //== Listen to system exceptions and signals
    /* $lab:coverage:off$ */
    const uncaught = (err) => {
        return {
            message: err.message,
            stack: err.stack,
            data: err.data
        };
    };

    process.once('uncaughtException', (err) => {

        const entry = uncaught(err);

        entry.tags = ['error', 'uncaught'];
        log2console(entry, 'error');

        return log(entry, null, false, () => process.exit(1));
    });
    process.on('unhandledRejection', (err) => {

        const entry = uncaught(err);

        entry.tags = ['error', 'uncaught', 'promise'];
        log(entry, null, false);
    });
    process.once('SIGTERM', shutdown('SIGTERM'));
    process.once('SIGINT', shutdown('SIGINT'));
    /* $lab:coverage:on$ */

    //== Listen to server events
    server.ext('onPostStop', onPostStop);

    //== Subscribe to server events
    server.on('log', (event) => {

        const entry = internals.error(event);

        if ('message' in event.data) {
            entry.message = event.data.message;
            delete event.data.message;
        }
        Object.assign(entry, event);

        log(entry);
    });
    server.on('request', (request, event) => {

        const code = request.raw.res.statusCode;
        const entry = internals.error(event);

        if ('message' in event.data) {
            entry.message = event.data.message;
            delete event.data.message;
        }
        Object.assign(entry, event);

        if (code >= 400) {
            entry.error = (entry.error) ? entry.error : {};
            entry.error = Object.assign(entry.error, request.response.source);
        }

        // Check if session is available
        if ('yar' in request) {
            entry.session = request.yar.id;
        }

        entry.tags = ['request', ...entry.tags];

        log(entry, request);
    });
    server.on('request-error', (request, err) => {

        const entry = internals.error({ error: err });

        entry.message = 'Request error';
        entry.tags = ['error', 'request'];

        log(entry, request);
    });

    //== Exposing logging functionality
    plugin.expose('log', log);
    plugin.expose('console', log2console);
    plugin.expose('error', error);

    //== Move along
    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'madero',
    version: pkg.version
};
