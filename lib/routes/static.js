// Internals ====================================
const internals = {};

// Routes Conf ==================================
internals.routes = [
    {
        method: 'GET',
        path: '/test/coverage',
        config: { auth: false },
        handler: {
            file: 'test/coverage.html'
        }
    }
];

// Exposing =====================================
module.exports = internals.routes;
