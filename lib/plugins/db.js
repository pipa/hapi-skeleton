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
    let msg = '';

    // Validates if the needed params where sent
    internals.defaults.validate(options, (err, opts) => {

        if (err) {
            return next(err);
        }

        //== Open connection with Mongo
        startDb = () => {

            const url = `mongodb://${opts.host}:${opts.port}/${opts.db}`;

            db = Mongoose.connect(url, opts.mongoOptions, (err) => {

                msg = `Mongoose connected to ${url}`;

                if (err) {
                    msg = 'Mongoose connection failure';
                }

                return console.log('mongo', msg);
            });

            // db.set('debug', true);
            // db.set('debug', (collectionName, methodName) => {

            //     console.log(arguments);
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
        process.on('SIGINT', () => {

            console.log('mongo', 'Mongoose disconnected on app termination');
            stopDb();
        });

        next(); // Move along
    });
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'db',
    version: Pckg.version
};
