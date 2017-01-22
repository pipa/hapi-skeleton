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

// Internals ====================================
const internals = {
    settings: {
        path: `${ config.get('/root') }/logs`,
        types: ['info', 'database', 'error', 'app', 'warning', 'request'],
        stopTimeoutMsec: 15 * 1000
    }
};

// Write to file ===============================
internals.log = (event, options = {}, request = null, callback) => {

    //== Defaults schema
    const schema = {
        entry: joi.object().required().keys({
            message: joi.alternatives().try(joi.string(), joi.object()).required(),
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
        internals.log2console(result.error, 'error');

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
        logDate: now.format('MM-DD-YYYY'),
        logTime: now.format('hh:mm:ss'),
        host: os.hostname()
    };
    let entryData = { tags: entry.tags };

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
    if (typeof entry.message === 'string') {
        entryData.message = entry.message;
    } else {
        entryData = Object.assign(entryData, entry.message);
    }

    log.type = entryData.tags[0];
    Object.assign(log, entryData);

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

    // Log to console if in dev
    if (config.get('/env') === 'dev') {
        console.log(logString.replace('\n', ''));
    }

    return done();
};

// If error, add error signature to object
internals.error = (data) => {

    if (data instanceof Error === false) {
        return data;
    }

    const error = {
        message: data.message,
        stack: data.stack
    };

    if (data.data) {
        error.data = data.data;
    }

    return error;
};

// Log to console
internals.log2console = (data, type = 'info') => {

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

        padStr = (padStr.length > (pad + 2)) ? padStr.slice(0, -1): padStr;

        return ` ${ padStr } `;
    };


    switch (type.toLowerCase()) {
        case 'error':
            bg = 'bgRed';
            break;
        case 'info':
            bg = 'bgBlue';
            break;
        case 'yellow':
            bg = 'bgYellow';
            break;
        default:
            bg = 'bgGreen';
            break;
    }

    //== Log to console if in dev
    if (config.get('/env') === 'dev') {
        console.log('');
        console.log(chalk[bg].bold.white(addPad(type)));
        console.log(prettyjson.render(data));
        console.log(chalk[bg].bold.white(addPad(`end ${ type }`)));
        console.log('');
    }
};

// Exposing Routes ==============================
exports.register = (plugin, options, next) => {

    //== Defaults with options passed in
    Object.assign(internals.settings, options);
    const { settings, log, log2console } = internals;
    const server = plugin.root;
    const onPostStop = (srv, nextExt) => {

        const entry = {
            tags: ['app', 'stop'],
            message: 'Server onPostStop - connection listeners are stopped'
        };

        process.removeAllListeners('SIGTERM');
        process.removeAllListeners('SIGINT');

        return log(entry, {}, null, nextExt);
    };
    const uncaught = (err) => {
        return {
            message: err.message,
            stack: err.stack,
            data: err.data
        };
    };
    const shutdown = (signal) => {

        return () => {

            const entry = {
                tags: ['app', 'signal', signal.toLowerCase()],
                message: `Server shutdown on signal: ${ signal }`
            };

            log(entry, { async: false });
            server.root.stop({ timeout: settings.stopTimeoutMsec }, process.exit);
        };
    };

    //== Listen to system exceptions and signals
    process.once('uncaughtException', (err) => {

        const entry = uncaught(err);

        entry.tags = ['error', 'uncaught'];
        log2console(entry, 'error');

        return log(entry, { async: false }, null, () => process.exit(1));
    });
    process.on('unhandledRejection', (err) => {

        const entry = uncaught(err);

        entry.tags = ['error', 'uncaught', 'promise'];
        log(entry, { async: false }, null);
    });
    process.once('SIGTERM', shutdown('SIGTERM'));
    process.once('SIGINT', shutdown('SIGINT'));

    //== Listen to server events
    server.ext('onPostStop', onPostStop);

    //== Subscribe to server events
    server.on('log', (event) => {

        const data = internals.error(event.data);
        const entry = {
            tags: event.tags,
            message: data
        };

        log(entry);
    });
    server.on('request', (request, event) => {

        const code = request.raw.res.statusCode;
        const data = internals.error(event.data);
        const entry = {
            tags: event.tags,
            message: data
        };

        if (code >= 400) {
            entry.error = request.response.source;
        }

        log(entry, {}, request);
    });
    server.on('request-error', (request, err) => {

        const entry = internals.error(err);

        entry.tags = ['error'];
        log(entry, {}, request);
    });

    //== Exposing logging functionality
    plugin.expose('log', log);

    //== Move along
    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'madero',
    version: pkg.version
};
