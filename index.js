// load modules ========================================
const Hoek = require('hoek');
const Config = require('~/config');
const Server = require('~/lib');

// internals Declarations ==============================
const internals = {
    options: { relativeTo: `${ __dirname }/lib` }
};

// init the server =====================================
Server.init(Config.get('/manifest'), internals.options, (err, server) => {

    Hoek.assert(!err, err);

    // server connections
    const api = server.select('api');

    server.app = {
        rootPath: __dirname
    };

    // logging start server
    console.log('app', `Api server started at: ${api.info.uri}`);
});
