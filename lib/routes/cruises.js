// Deps =========================================
const cruisesCtrl = require('../controllers/cruises');

// Internals ====================================
const internals = {};

// Routes Conf ==================================
internals.routes = [
    { method: 'GET', path: '/cruise-passengers/', config: cruisesCtrl.index }
];

// Exposing =====================================
module.exports = internals.routes;
