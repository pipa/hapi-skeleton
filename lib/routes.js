'use strict';

// load Modules =======================================
const Controllers = require('./controllers');
const Config = require('getconfig');

// Exporting the plugin
exports.register = (plugin, options, next) => {

    let routes = [];
    let key;

    // looping Controllers object to dynamically add routes
    for(key in Controllers) {
        Array.prototype.push.apply(routes, Controllers[key].routes);
    }

    //====== routes
    plugin.route(routes);

    //=== move
    next();
}

exports.register.attributes = {
    name:  'routes',
    version: require('../package.json').version
}