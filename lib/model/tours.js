'use strict';

// Load Modules =================================
const Wreck = require('wreck');
const config = require('getconfig');

// Internals Namespace ==========================
const internals = {};

// API wrapper class ============================
class Tours {
    constructor() {
        let { instance } = internals;
        if (!instance) {
            instance = this;
        }

        Wreck.defaults({
            baseUrl: config.api.host
        });

        return instance;
    }

    get(path) {
        let promise = new Promise((resolve, reject) => {

            console.log(config.api.host);
            Wreck.get(`${config.api.host}${path}`, { json: true }, (err, res, payload) => {

                if (err) {
                    reject(err);
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
