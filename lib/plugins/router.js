// Load Modules =================================
const Routes = require('~/lib/routes');
const Pkg = require('~/package.json');

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    const routes = [];
    let key;

    // Looping Routes object to dynamically add routes
    for (key in Routes) {
        Array.prototype.push.apply(routes, Routes[key]);
    }

    //== Routes
    plugin.route(routes);

    //== Move Along
    next();
};
exports.register.attributes = {
    name: 'routes',
    version: Pkg.version
};
