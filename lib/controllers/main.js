// Load Modules =================================
const Tours = require('../model/tours');
const Boom = require('boom');
const tours = new Tours();

// Internals ====================================
const internals = {};

// Homepage =====================================
internals.home = {
    handler: (request, reply) => {

        tours
        .get('/tours/featured')
        .catch((err) => reply(Boom.badImplementation(err)))
        .then((data) => {

            console.log(data);
            return reply.view('main/home', { data });
        });
    }
};

// Contact Us ===================================
internals.contact = {
    handler: (request, reply) => reply.view('main/contact')
};

// About ========================================
internals.about = {
    handler: (request, reply) => reply.view('main/about')
};

// Test =========================================
internals.test = {
    handler: (request, reply) => reply.view('main/test')
};

// FAQ =========================================
internals.faq = {
    handler: (request, reply) => reply.view('main/faq')
};

// Test =========================================
internals.tc = {
    handler: (request, reply) => reply.view('main/tc')
};

// Test =========================================
internals.privacy = {
    handler: (request, reply) => reply.view('main/privacy')
};

// 404 ==========================================
internals.notFound = {
    handler: (request, reply) => reply.view('main/404').code(404)
};

// Error Page Test ==============================
internals.err = {
    handler: (request, reply) => reply(new Error('I\'ll be a 500'))
};

// Exposing =====================================
module.exports = internals;
