// Deps =========================================
const Lab = require('lab');
const Code = require('code');
const Server = require('~/lib');
const Path = require('path');

// Internals ====================================
const internals = {
    composeOptions: {
        relativeTo: Path.resolve(__dirname, '../lib')
    },
    manifest: {
        connections: [
            {
                port: 3000,
                host: 'localhost'
            }
        ],
        registrations: [
            { plugin: './plugins/madero' }
        ]
    }
};

// Shortcuts ====================================
const lab = exports.lab = Lab.script();
const { describe, it, before, after } = lab;
const expect = Code.expect;

// Main Experiment ==============================
describe('Madero -', () => {

    let server;
    let madero;

    before(done => {

        Server.init(internals.manifest, internals.composeOptions, (err, _server) => {

            expect(err).to.not.exist();
            server = _server;
            madero = server.plugins.madero;

            server.route({
                method: 'GET',
                path: '/request/error',
                handler: () => {

                    throw new Error('You should test for this');
                }
            });

            done();
        });
    });

    it('Log an error', done => {

        const _err = new Error('Test error');

        madero.log({ message: _err, tags: ['error'] }, {}, null, (err) => {

            expect(err).to.not.exist();
            done();
        });
    });

    it('Log an error to console', done => {

        const _err = new Error('Test error');

        madero.console(_err, 'error', () => {

            return done();
        });
    });

    it('Log a string message', done => {

        madero.log({ message: 'Hello World!', tags: ['app'] }, {}, null, (err) => {

            expect(err).to.not.exist();
            done();
        });
    });

    it('Log a message to console in different colors', done => {

        madero.console('red', 'error');
        madero.console('blue', 'info');
        madero.console('yellow', 'warn');
        madero.console('green', 'test');
        done();
    });

    it('Write to file async', done => {

        madero.log({ message: 'Hello World!', tags: ['app'] }, { async: false }, null, (err) => {

            expect(err).to.not.exist();
            done();
        });
    });

    it('Bad log signature', done => {

        madero.log({}, null, null, (err) => {

            expect(err).to.exist();
            done();
        });
    });

    // it('Log a bad request', done => {

    //     const options = {
    //         method: 'GET',
    //         url: '/request/error'
    //     };

    //     server.inject(options, (response) => {

    //         expect(response.statusCode).to.equal(500);
    //         done();
    //     });
    // });

    it('Log a 404 request', done => {

        const options = {
            method: 'GET',
            url: '/not-found'
        };

        server.inject(options, (response) => {

            expect(response.statusCode).to.equal(404);
            done();
        });
    });

    after(done => {

        server.stop();
        done();
    });
});
