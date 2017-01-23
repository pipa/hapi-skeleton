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
                port: 3000,
                host: 'localhost'
            }
        ],
        registrations: Config.get('/manifest/registrations')
    }
};

// Shortcuts ====================================
const lab = exports.lab = Lab.script();
const { describe, it, before, after } = lab;
const expect = Code.expect;

// Main Experiment ==============================
describe('/users endpoint -', () => {

    let recordId = null;
    let token = null;
    let headers = null;
    let server;
    const payload = {
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'random123@helloworld.com'
    };

    before(done => {

        Server.init(internals.manifest, internals.composeOptions, (err, _server) => {

            expect(err).to.not.exist();
            expect(_server).to.exist();
            server = _server;

            const options = {
                method: 'GET',
                url: '/get/token'
            };

            server.inject(options, response => {

                expect(response.result.status).to.equal('success');
                token = response.result.data.token;
                headers = { 'Authorization': `Bearer ${ token }` };
                done();
            });
        });
    });

    // #1
    it('should require authentication', done => {

        const options = {
            payload,
            method: 'POST',
            url: '/user'
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('fail');
            expect(response.result.statusCode).to.equal(401);
            done();
        });
    });

    // #2
    it('GET all records', done => {

        const options = {
            method: 'GET',
            url: '/users'
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('success');
            expect(response.result.data).to.be.an.array();
            done();
        });
    });

    // #3
    it('POST create a new record', done => {

        const options = {
            payload, headers,
            method: 'POST',
            url: '/user'
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('success');
            recordId = response.result.data._id;
            done();
        });
    });

    // #4
    it('GET top 10 records', done => {

        const options = {
            headers,
            method: 'GET',
            url: '/users/10'
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('success');
            expect(response.result.data).to.be.an.array();
            done();
        });
    });

    // #5
    it('GET created record', done => {

        const options = {
            headers,
            method: 'GET',
            url: `/user/${recordId}`
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('success');
            expect(response.result.data).to.have.length(1);
            done();
        });
    });

    // #6
    it('GET fail getting record', done => {

        const options = {
            headers,
            method: 'GET',
            url: '/user/587b8119586eb2ce7f184123'
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('fail');
            expect(response.result.statusCode).to.equal(404);
            done();
        });
    });

    // #7
    it('PUT created record', done => {

        const options = {
            headers,
            method: 'PUT',
            url: '/user',
            payload: {
                _id: recordId,
                firstName: 'Bar',
                lastName: 'Foo'
            }
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('success');
            done();
        });
    });

    // #8
    it('DELETE created record', done => {

        const options = {
            headers,
            method: 'DELETE',
            url: `/user/${recordId}`
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('success');
            done();
        });
    });

    // #9
    it('DELETE fail', done => {

        const options = {
            headers,
            method: 'DELETE',
            url: '/user/587b8119586eb2ce7f184123'
        };

        server.inject(options, response => {

            expect(response.result.status).to.equal('fail');
            expect(response.result.statusCode).to.equal(404);
            done();
        });
    });

    after(done => {

        server.stop();
        done();
    });
});
