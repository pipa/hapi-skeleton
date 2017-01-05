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

                const scoot = request.plugins.scooter.toJSON();
                const useragent = {
                    browser: `${scoot.family} v${scoot.major}.${scoot.minor}.${scoot.patch}`,
                    device: scoot.device.family,
                    os: `${scoot.os.family} v${scoot.os.major}.${scoot.os.minor}.${scoot.os.patch}`,
                    source: request.headers['user-agent']
                };
                const { remoteAddress, referrer } = request.info;
                server.app.logData = {
                    remoteAddress, referrer, useragent,
                    host: os.hostname()
                };
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
