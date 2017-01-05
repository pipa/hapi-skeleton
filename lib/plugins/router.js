// Load Modules =================================
const Controllers = require('~/lib/controllers');
const Pkg = require('~/package.json');

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    const routes = [];
    let key;

    // Looping Controllers object to dynamically add routes
    for (key in Controllers) {
        Array.prototype.push.apply(routes, Controllers[key].routes);
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
