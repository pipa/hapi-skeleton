// Load Modules =================================
const Boom = require('boom');
const Cruises = require('../model/cruises');
const cruises = new Cruises();

// Internals ====================================
const internals = {};

// Index ========================================
internals.index = {
    handler: (request, reply) => {

        cruises
        .getAll()
        .then((data) => {

            return reply.view('cruises/index', { data });
        })
        .catch((err) => {

            return reply(Boom.badImplementation(err));
        });
    }
};

// Exposing =====================================
module.exports = internals;
