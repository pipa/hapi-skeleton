// Deps =========================================
const Joi = require('joi');
const Mongoose = require('mongoose');
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

    // const opts = Object.assign({}, internals.defaults, options);
    let startDb = null;
    let stopDb = null;
    let db;
    let desc = '';

    // Validates if the needed params where sent
    internals.defaults.validate(options, (err, opts) => {

        if (err) {
            return next(err);
        }

        //== Open connection with Mongo
        startDb = () => {

            const url = `mongodb://${opts.host}:${opts.port}/${opts.db}`;
            let desc;

            db = Mongoose.connect(url, opts.mongoOptions, (err) => {

                let { host, port, db } = opts;

                if (err) {
                    plugin.log(['error', 'mongo', 'connection'], { desc: 'Failed to connect', host, port, db });
                    return false;
                }

                plugin.log(['mongo', 'connection'], { desc: 'Successfully connected', host, port, db });
            });

            // db.set('debug', true);
            // db.set('debug', (collection, method, query, doc, options) => {

            //     desc = `db.${collection}.${method}(${JSON.stringify(query)}, ${JSON.stringify(options || {})});`;
            //     plugin.log(['mongo', 'info'], { desc, collection, method, query, doc, options });
            // });

            return db;
        };

        //== Kills mongo connection
        stopDb = (shouldKill = true) => {

            Mongoose.disconnect(() => {

                // `shouldKill` added so that tests can
                // continue after disconnect
                if (shouldKill) {
                    internals.close();
                }
            });
        };

        //== Kickstart the DB
        startDb();

        //== Exposing plugin's properties and methods
        plugin.expose('mongoose', Mongoose);
        plugin.expose('start', startDb);
        plugin.expose('stop', stopDb);

        // If the Node process ends, close the Mongoose connection
        // process.on('SIGINT', () => {

        //     plugin.log('mongo', 'Mongoose disconnected on app termination');
        //     stopDb();
        // });

        next(); // Move along
    });
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'db',
    version: Pckg.version
};
