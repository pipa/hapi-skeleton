/*
// Deps =========================================
const Lab = require('lab');
const Code = require('code');
const Server = require('~/lib');
const Path = require('path');
const Config = require('~/config');

// Internals ====================================
const internals = {
    composeOptions: {
        relativeTo: Path.resolve(__dirname, '../lib')
    },
    mongo: Config.get('/database/mongodb')
};

// Glue Manifest ================================
internals.manifest = {
    connections: [
        {
            labels: ['api'],
            port: 2001,
            host: 'localhost'
        }
    ],
    registrations: []
};

// Shortcuts ====================================
const lab = exports.lab = Lab.script();
const { describe, it, before } = lab;
const expect = Code.expect;

// Mongo test ===================================
describe('Mongo', () => {

    let _server;

    before((done) => {

        Server.init(internals.manifest, internals.composeOptions, (err, server) => {

            expect(err).to.not.exist();

            server.register({
                register: require('~/lib/plugins/db'),
                options: internals.mongo
            }, (err) => {

                expect(err).to.not.exist();
                _server = server;
                done();
            });
        });
    });

    it('should have mongoose', (done) => {

        expect(_server.plugins.db.mongoose).to.exist();
        done();
    });

    it('should disconnect mongoose', (done) => {

        // TODO: should check if loggin disconnect
        // will do this after the logging mechanism is in place
        _server.plugins.db.stop(false);
        done();
    });
});
*/
