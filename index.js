'use strict';

// load modules ========================================
const Hoek = require('hoek');
const Config = require('getconfig');
const Server = require('./lib');


// internals Declarations ==============================
const internals = {
    options: { relativeTo: `${__dirname}/lib` }
};

// init the server =====================================
Server.init(Config.manifest, internals.options,(err, server) => {

    Hoek.assert(!err, err);

    // server connections
    const api = server.select('api');
    server.app = {
        rootPath: __dirname
    };

    // logging start server
    console.log(`Api server starte at: ${api.info.uri}`);

});