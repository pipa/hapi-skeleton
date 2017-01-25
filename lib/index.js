// Deps =========================================
const Glue = require('glue');
const Hoek = require('hoek');
const os = require('os');

// Glue =========================================
exports.init = (manifest, options, next) => {

    Glue.compose(manifest, options, (err, server) => {

        Hoek.assert(!err, err);

        //== Add `onRequest` handling
        server.ext({
            type: 'onRequest',
            method: (request, reply) => {

                server.app.timer = new Hoek.Timer();

                return reply.continue();
            }
        });

        //== Kickstart my heart
        server.start((_err) => {

            next(_err, server);
        });
    });
};
