// Load Modules =================================
const Tours = require('../model/tours');
const Boom = require('boom');
const config = require('getconfig');
const tours = new Tours();

// Internals ====================================
const internals = {};

// Homepage =====================================
internals.home = {
    handler: (request, reply) => {

        tours
        .get('/tours/featured')
        .then((data) => {

            return reply.view('main/home', { data });
        })
        .catch((err) => {

            return reply(Boom.badImplementation(err));
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

// Routes Conf ==================================
internals.routes = [
    { method: 'GET', path: '/', config: internals.home },
    { method: 'GET', path: '/contact-us/', config: internals.contact },
    { method: 'GET', path: '/about-us/', config: internals.about },
    { method: 'GET', path: '/test/', config: internals.test },
    { method: 'GET', path: '/faq/', config: internals.faq },
    { method: 'GET', path: '/privacy-policy/', config: internals.privacy },
    { method: 'GET', path: '/terms-of-use/', config: internals.tc },
    { method: 'GET', path: '/err', config: internals.err },
    { method: '*', path: '/{p*}', config: internals.notFound }
];

// Exposing =====================================
module.exports = internals;
