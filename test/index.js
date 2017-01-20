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
            { plugin: './plugins/heartbeat' }
        ]
    }
};

// Shortcuts ====================================
const lab = exports.lab = Lab.script();
const { describe, it, before, after } = lab;
const expect = Code.expect;

// Main Experiment ==============================
describe('Server', () => {

    let server;

    before(done => {

        Server.init(internals.manifest, internals.composeOptions, (err, _server) => {

            expect(err).to.not.exist();
            server = _server;
            done();
        });
    });

    it('can be started', done => {

        // Overriding the default connection
        internals.manifest.connections = [
            {
                labels: ['api'],
                port: 3001,
                host: 'localhost'
            }
        ];
        Server.init(internals.manifest, internals.composeOptions, (err, _server) => {

            expect(err).to.not.exist();
            expect(_server).to.exist();
            _server.stop();
            done();
        });
    });

    it('heartbeat check', done => {

        const options = {
            method: 'GET',
            url: '/heartbeat'
        };

        server.inject(options, (response) => {

            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    after(done => {

        server.stop();
        done();
    });
});
