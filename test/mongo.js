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
    mongo: Config.get('/database/mongodb'),

};

// Glue Manifest ================================
internals.manifest = {
    connections: [
        {
            port: 3000,
            host: 'localhost'
        }
    ],
    registrations: [{ plugin: './plugins/madero' }, {
        plugin: {
            register: './plugins/db',
            options: internals.mongo
        }
    }]
};

// Shortcuts ====================================
const lab = exports.lab = Lab.script();
const { describe, it, before, after } = lab;
const expect = Code.expect;

// Mongo test ===================================
describe('Mongo -', () => {

    let server;

    before(done => {

        Server.init(internals.manifest, internals.composeOptions, (err, _server) => {

            expect(err).to.not.exist();
            expect(_server).to.exist();
            server = _server;
            done();
        });
    });

    it('has mongoose', done => {

        expect(server.plugins.db.mongoose).to.exist();
        expect(server.plugins.db.connection).to.exist();
        done();
    });

    it('disconnect mongoose', done => {

        // TODO: should check if loggin disconnect
        // will do this after the logging mechanism is in place
        server.plugins.db.stop(false, () => {

            done();
        });
    });

    // it('handles multiple connections', done => {

    //     const manifest = {
    //         connections: [
    //             {
    //                 port: 3005,
    //                 host: 'localhost'
    //             }
    //         ],
    //         registrations: [
    //             {
    //                 plugin: {
    //                     register: './plugins/db',
    //                     options: {
    //                         db: 'qcr',
    //                         connections: [
    //                             {
    //                                 host: 'aws-us-east-1-portal.12.dblayer.com',
    //                                 port: 15324,
    //                             },
    //                             {
    //                                 host: 'aws-us-east-1-portal.15.dblayer.com',
    //                                 port: 15324,
    //                             }
    //                         ],
    //                         mongoOptions: {
    //                             user: 'qcr',
    //                             pass: 'QCR@2016',
    //                             mongos: {}
    //                         }
    //                     }
    //                 }
    //             }
    //         ]
    //     };

    //     Server.init(manifest, internals.composeOptions, (err, _server) => {

    //         expect(err).to.not.exist();
    //         expect(_server).to.exist();
    //         _server.plugins.db.stop(false, () => {

    //             _server.stop();
    //             done();
    //         });
    //     });
    // });

    // it('handle wrong configuration', done => {

    //     mongoPlug.register.attributes.name = 'stub-db';

    //     server.register({
    //         register: mongoPlug,
    //         options: {
    //             port: 'string when should be a number'
    //         }
    //     }, (err) => {

    //         expect(err).to.exist();
    //         expect(err.name).to.equal('ValidationError');
    //         done();
    //     });
    // });

    after((done) => {

        server.stop();
        done();
    });
});
