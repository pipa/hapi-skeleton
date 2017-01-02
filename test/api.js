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
    manifest: {
        connections: [
            {
                labels: ['api'],
                port: 2002,
                host: 'localhost'
            }
        ],
        registrations: Config.get('/manifest/registrations')
    }
};

// Shortcuts ====================================
const lab = exports.lab = Lab.script();
const { describe, it, before } = lab;
const expect = Code.expect;

// Main Experiment ==============================
describe('Basic HTTP Tests', () => {

    let recordId = null;
    let server;

    before((done) => {

        Server.init(internals.manifest, internals.composeOptions, (err, _server) => {

            expect(err).to.not.exist();
            server = _server;
            done();
        });
    });

    it('POST create a new record', (done) => {

        const options = {
            method: 'POST',
            url: '/home',
            payload: {
                name: 'Luis Matute',
                description: 'awesome test'
            }
        };

        server.inject(options, (response) => {

            expect(response.result.status).to.equal('success');
            recordId = response.result.data._id;
            done();
        });
    });

    it('GET all records', (done) => {

        const options = {
            method: 'GET',
            url: '/homes'
        };

        server.inject(options, (response) => {

            expect(response.result.status).to.equal('success');
            expect(response.result.data).to.be.an.array();
            done();
        });
    });

    it('GET top 10 records', (done) => {

        const options = {
            method: 'GET',
            url: '/homes/10'
        };

        server.inject(options, (response) => {

            expect(response.result.status).to.equal('success');
            expect(response.result.data).to.be.an.array();
            done();
        });
    });

    it('GET created record', (done) => {

        const options = {
            method: 'GET',
            url: `/home/${recordId}`
        };

        server.inject(options, (response) => {

            expect(response.result.status).to.equal('success');
            expect(response.result.data).to.have.length(1);
            done();
        });
    });

    it('PUT created record', (done) => {

        const options = {
            method: 'PUT',
            url: '/home',
            payload: {
                _id: recordId,
                name: 'Maria Guardado',
                description: 'Some randome text'
            }
        };

        server.inject(options, (response) => {

            expect(response.result.status).to.equal('success');
            done();
        });
    });

    it('DELETE created record', (done) => {

        const options = {
            method: 'DELETE',
            url: `/home/${recordId}`
        };

        server.inject(options, (response) => {

            expect(response.result.status).to.equal('success');
            done();
        });
    });
});
