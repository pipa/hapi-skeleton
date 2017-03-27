// Deps =========================================
const mainCtrl = require('../controllers/main');

// Internals ====================================
const internals = {};

// Routes Conf ==================================
internals.routes = [
    { method: 'GET', path: '/', config: mainCtrl.home },
    { method: 'GET', path: '/contact-us/', config: mainCtrl.contact },
    { method: 'GET', path: '/about-us/', config: mainCtrl.about },
    { method: 'GET', path: '/test/', config: mainCtrl.test },
    { method: 'GET', path: '/faq/', config: mainCtrl.faq },
    { method: 'GET', path: '/privacy-policy/', config: mainCtrl.privacy },
    { method: 'GET', path: '/terms-of-use/', config: mainCtrl.tc },
    { method: 'GET', path: '/err', config: mainCtrl.err },
    { method: '*', path: '/{p*}', config: mainCtrl.notFound }
];

// Exposing =====================================
module.exports = internals.routes;
