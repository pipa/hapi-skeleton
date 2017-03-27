'use strict';

// Load Modules =================================
const Tours = require('../model/tours');
const Boom = require('boom');
const tours = new Tours();

// Internals ====================================
const internals = {};

// Cart =========================================
internals.index = {
    handler: (request, reply) => reply.view('cart/index')
};

// Checkout =========================================
internals.checkout = {
    handler: (request, reply) => reply.view('cart/checkout')
};

// Confirmation =================================
internals.confirmation = {
    handler: (request, reply) => {

      const resId = request.params.resId ? encodeURIComponent(request.params.resId) : null;

      tours
        .get(`/reservation/${ resId }`)
        .then((data) => {

            let { items, total } = data;
            return reply.view('cart/confirmation', { items, total });
        })
        .catch((err) => {

            return reply(Boom.badImplementation(err));
        });
    }
};

// Exposing =====================================
module.exports = internals;
