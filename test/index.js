// Deps =========================================
const Lab = require('lab');
const Code = require('code');
const Server = require('~/lib');
// const Version = require('~/lib/version');
const Path = require('path');

// Internals ====================================
const internals = {
    composeOptions: {
        relativeTo: Path.resolve(__dirname, '../lib')
    },
    manifest: {
        connections: [
            {
                labels: ['api'],
                port: 2000,
                host: 'localhost'
            }
        ],
        registrations: []
    }
};

// Shortcuts ====================================
const lab = exports.lab = Lab.script();
const { describe, it } = lab;
const expect = Code.expect;

// Main Experiment ==============================
describe('Main', () => {

    it('Server can be started', (done) => {

        Server.init(internals.manifest, internals.composeOptions, (err, server) => {

            expect(err).to.not.exist();
            expect(server).to.exist();
            done();
        });
    });
});
