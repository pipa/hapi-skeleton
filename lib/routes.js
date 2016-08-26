'use strict';

// load Modules =======================================
const Controllers = require('./controllers');
const Config = require('getconfig');

// Exporting the plugin
exports.register = (plugin, options, next) => {


    //====== routes
    plugin.route([
        // home pages
        { method: 'GET', path: '/', config: Controllers.Home.read },
        { method: 'GET', path: '/{_id}', config: Controllers.Home.read },
        { method: 'POST', path: '/', config: Controllers.Home.create }
    ]);

    //=== move
    next();
};


exports.register.attributes = {
    name:  'routes',
    version: require('../package.json').version
};