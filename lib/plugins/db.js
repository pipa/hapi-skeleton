// Deps =========================================
const joi = require('joi');
const mongoose = require('mongoose');
const hoek = require('hoek');
const pkg = require('~/package.json');

// Internals ====================================
const internals = {
    connSchema: {
        host: joi.string().default('localhost'),
        port: joi.number().default(27017)
    },
    close: () => {

        process.exit(0);
    }
};

// Defaults Schema ==============================
internals.schema = {
    db: joi.string().required(),
    connections: joi.alternatives().try(
        joi.array().items(joi.object().keys(internals.connSchema)),
        joi.object().keys(internals.connSchema)
    ).required(),
    mongoOptions: joi.object().keys({
        user: joi.string(),
        pass: joi.string(),
        mongos: joi.object().when('connections', {
            is: 'Array',
            then: joi.required()
        })
    })
};

// Normalize options ============================
internals.normalizeOptions = (options) => {

    let result = Object.assign({ uri: 'mongodb://' }, options);
    const conns = options.connections;

    if (conns && conns.constructor === Array) {
        let conn;

        for (let i = 0, len = conns.length; i < len; ++i) {
            conn = conns[i];
            result.uri += `${ conn.host }:${ conn.port },`;
        }
        result.uri = result.uri.slice(0, -1);
    } else {
        result.uri += `${ result.uri }${ conns.host }:${ conns.port }`;
    }

    result.uri += `/${ result.db }`;

    return result;
};

// Setting native promises to mongoose ==========
mongoose.Promise = global.Promise;

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    let startDb = null;
    let stopDb = null;
    let db;
    const schemaValidate = joi.validate(options, internals.schema, { allowUnknown: true });

    // Check if schema validation had an error
    if (schemaValidate.error !== null) {
        plugin.log(['error', 'plugin', 'db', 'optionsValidation'], schemaValidate.error);

        return next(schemaValidate.error);
    }

    const opts = internals.normalizeOptions(schemaValidate.value);
    const { uri, connections, mongoOptions } = opts;

    //== Open connection with Mongo
    startDb = (callback) => {

        const done = callback || hoek.ignore;
        const entry = { message: `Successfully connected to: ${ uri }` };

        db = mongoose.connect(uri, mongoOptions, (err) => {

            entry.connections = connections;
            entry.db = opts.db;

            if (err) {
                entry.error = err;
                entry.message = `Failed to connect to: ${ uri }`;
                plugin.log(['error', 'database', 'connection'], entry);

                return false;
            }

            plugin.log(['database', 'connection', 'start'], entry);
        });

        return done(db);
    };

    //== Kills mongo connection
    stopDb = (shouldKill = true, done) => {

        mongoose.disconnect(() => {

            plugin.log(['database', 'connection', 'stop'], entry);

            // `shouldKill` added so that tests can
            // continue after disconnect
            if (shouldKill) {
                internals.close();
            }

            if (typeof done === 'function') {
                done();
            }
        });
    };

    //== Kickstart the DB
    startDb();

    //== Exposing plugin's properties and methods
    plugin.expose('mongoose', mongoose);
    plugin.expose('start', startDb);
    plugin.expose('stop', stopDb);
    plugin.expose('connection', db);

    next(); // Move along
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'db',
    version: pkg.version
};
