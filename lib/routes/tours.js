// Deps =========================================
const toursCtrl = require('../controllers/tours');

// Internals ====================================
const internals = {};

// Routes Conf ==================================
internals.routes = [
    { method: 'GET', path: '/tours/', config: toursCtrl.index },
    { method: 'GET', path: '/tour/{tourId}/{tourName}/', config: toursCtrl.details }
];

// Exposing =====================================
module.exports = internals.routes;
