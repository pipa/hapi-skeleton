// Deps =========================================
const Lab = require('lab');
const Code = require('code');
const Server = require('~/lib');
const Path = require('path');
const Pkg = require('~/package.json');

// Internals ====================================
const internals = {
    composeOptions: {
        relativeTo: Path.resolve(__dirname, '../lib')
    },
    manifest: {
        connections: [
            {
                labels: ['api'],
                port: 3000,
                host: 'localhost'
            }
        ],
        registrations: [
            { plugin: './plugins/heartbeat' },
            { plugin: './plugins/version' },
            { plugin: './plugins/shutdown' }
        ]
    }
};

// Shortcuts ====================================
const lab = exports.lab = Lab.script();
const { describe, it, before } = lab;
const expect = Code.expect;

// Main Experiment ==============================
describe('Main', () => {

    let server;

    before((done) => {

        Server.init(internals.manifest, internals.composeOptions, (err, _server) => {

            expect(err).to.not.exist();
            server = _server;
            done();
        });
    });

    it('Server can be started', (done) => {

        // Overriding the default connection
        internals.manifest.connections = [
            {
                labels: ['api'],
                port: 3001,
                host: 'localhost'
            }
        ];
        Server.init(internals.manifest, internals.composeOptions, (err, server) => {

            expect(err).to.not.exist();
            expect(server).to.exist();
            server.stop();
            done();
        });
    });

    it('Heartbeat check', (done) => {

        const options = {
            method: 'GET',
            url: '/heartbeat'
        };

        server.inject(options, (response) => {

            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('Version check', (done) => {

        const options = {
            method: 'GET',
            url: '/version'
        };

        server.inject(options, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(Pkg.version);
            done();
        });
    });

    it('Server can gracefully stop', (done) => {

        Server.init(internals.manifest, internals.composeOptions, (err, server) => {

            expect(err).to.not.exist();
            expect(server).to.exist();
            server.stop();
            done();
        });
    });
});
