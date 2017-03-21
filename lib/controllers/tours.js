'use strict';

// Load Modules =================================
const Tours = require('../model/tours');
const Boom = require('boom');
const config = require('getconfig');
const tours = new Tours();

// Internals ====================================
const internals = {};

// Tours index ==================================
internals.index = {
    handler: (request, reply) => {

        tours
        .get('/tours')
        .then((data) => {

            return reply.view('tours/index', { data });
        })
        .catch((err) => {

            return reply(Boom.badImplementation(err));
        });
    }
};

// Tours Details ================================
internals.details = {
    handler: (request, reply) => {

        const tourId = request.params.tourId ? encodeURIComponent(request.params.tourId) : null;

        if (!tourId) {
            return reply(Boom.notFound('No tour found.'));
        }

        tours
        .get('/tours')
        .then((tours) => {
            let tour = {};

            tours.forEach(t => {
                if (t.tour_id === tourId) {
                    tour = t;
                }
            })

            return reply.view('tours/details', { tour, tours });
        })
        .catch((err) => {

            return reply(Boom.badImplementation(err));
        });
    }
};

// Routes Conf ==================================
internals.routes = [
    { method: 'GET', path: '/tours/', config: internals.index },
    { method: 'GET', path: '/tour/{tourId}/{tourName}/', config: internals.details }
];

// Exposing =====================================
module.exports = internals;
