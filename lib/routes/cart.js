// Deps =========================================
const cartCtrl = require('../controllers/cart');

// Internals ====================================
const internals = {};

// Routes Conf ==================================
internals.routes = [
    { method: 'GET', path: '/cart/', config: cartCtrl.index },
    { method: 'GET', path: '/confirmation/{resId}', config: cartCtrl.confirmation },
    { method: 'GET', path: '/checkout/', config: cartCtrl.checkout }
];

// Exposing =====================================
module.exports = internals.routes;
