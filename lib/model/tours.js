// Load Modules =================================
const Wreck = require('wreck');
const config = require('~/config');

// Internals Namespace ==========================
const internals = {
    wreck: Wreck.defaults({
        baseUrl: config.get('/api/host'),
        headers: { 'Authorization': `Bearer ${ config.get('/jwt') }` },
        json: true
    })
};

// API wrapper class ============================
class Tours {
    constructor() {
        let { instance } = internals;
        if (!instance) {
            instance = this;
        }

        return instance;
    }

    get(path) {

        const { wreck } = internals;
        let promise = new Promise((resolve, reject) => {

            wreck.get(path, (err, res, payload) => {

                if (err) {
                    reject(err);
                }
                if (payload.status !== 'success') {
                    reject(payload.data.message);
                }
                if (payload.data.constructor === Array && payload.data.length === 1) {
                    payload.data = payload.data[0];
                }

                const data = payload.data;

                resolve(data);
            });
        });

        return promise;
    }
}

// Exposing =====================================
module.exports = Tours;

// How to do Multiple Wrecks
// (req, reply) => {

//     // reply = once(reply);

//     Wreck.get('url', { json: true }, (err, res, friends) => next(err, { friends }));
//     Wreck.get('url', { json: true }, (err, res, recent) => next(err, { recent }));
//     Wreck.get('url', { json: true }, (err, res, prefs) => next(err, { prefs }));

//     let results = {};
//     const next = (err, result) => {

//         if (err) { return reply(err); }

//         results = Object.assign({}, results, result);
//         if (results.friends && results.recent && results.prefs) {
//             return reply(results);
//         }
//     };
// };
