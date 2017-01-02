// Deps =========================================
const Glue = require('glue');
const Hoek = require('hoek');

// Glue =========================================
exports.init = (manifest, options, next) => {

    Glue.compose(manifest, options, (err, server) => {

        Hoek.assert(!err, err);

        server.start((_err) => {

            next(_err, server);
        });
    });
};
