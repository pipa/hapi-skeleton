// Deps =========================================
const Joi = require('joi');
const Mongoose = require('mongoose');
const hoek = require('hoek');
const Pckg = require('~/package.json');

// Internals ====================================
const internals = {
    defaults: Joi.object().keys({
        host: Joi.string().default('localhost'),
        port: Joi.number().default(27017),
        db: Joi.string().default('test'),
        mongoOptions: Joi.object()
    }),
    close: () => {

        process.exit(0);
    }
};

// Setting native promises to mongoose ==========
Mongoose.Promise = global.Promise;

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    let startDb = null;
    let stopDb = null;
    let _db;

    // Validates if the needed params where sent
    internals.defaults.validate(options, (err, opts) => {

        if (err) {
            return next(err);
        }

        //== Open connection with Mongo
        startDb = (callback) => {

            const url = `mongodb://${opts.host}:${opts.port}/${opts.db}`;
            const done = callback || hoek.ignore;
            const entry = { message: `Successfully connected to: ${ url }` };

            _db = Mongoose.connect(url, opts.mongoOptions, (err) => {

                const { host, port, db } = opts;

                entry.port = port;
                entry.host = host;
                entry.db = db;

                if (err) {
                    entry.message = `Failed to connect to: ${ url }`;
                    plugin.log(['error', 'database', 'connection'], entry);

                    return false;
                }

                plugin.log(['database', 'connection'], entry);
            });

            return done(_db);
        };

        //== Kills mongo connection
        stopDb = (shouldKill = true, done) => {

            Mongoose.disconnect(() => {

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
        plugin.expose('mongoose', Mongoose);
        plugin.expose('start', startDb);
        plugin.expose('stop', stopDb);
        plugin.expose('connection', _db);

        next(); // Move along
    });
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'db',
    version: Pckg.version
};
