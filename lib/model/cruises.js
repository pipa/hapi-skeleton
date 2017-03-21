'use strict';

// Load Modules =================================
const Wreck = require('wreck');
const config = require('getconfig');

// Internals Namespace ==========================
const internals = {};

// API wrapper class ============================
class Cruises {
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

    getAll() {

        let promise = new Promise((resolve, reject) => {

            let data;
            Wreck.get(`${config.api.host}/cruise-ports`, { json: true }, (err, res, ports) => next(err, { ports }));
            Wreck.get(`${config.api.host}/cruise-lines`, { json: true }, (err, res, cruiseLines) => next(err, { cruiseLines }));

            let results = {};
            const next = (err, result) => {

                if (err) { reject(err); }

                results = Object.assign({}, results, result);
                if (results.ports && results.cruiseLines) {

                    data = {
                        ports: results.ports.data,
                        cruiseLines: results.cruiseLines.data
                    };
                    resolve(data);
                }
            };

        });

        return promise;
    }
}

// Exposing =====================================
module.exports = Cruises;
